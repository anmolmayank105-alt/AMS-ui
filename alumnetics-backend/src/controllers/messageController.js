const Message = require('../models/Message');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get conversations for current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    
    // Get unique conversations where user is participant
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $addFields: {
          conversationId: {
            $cond: {
              if: { $lt: ['$sender', '$recipient'] },
              then: { $concat: [{ $toString: '$sender' }, '_', { $toString: '$recipient' }] },
              else: { $concat: [{ $toString: '$recipient' }, '_', { $toString: '$sender' }] }
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.recipient',
          foreignField: '_id',
          as: 'recipientInfo'
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$lastMessage.sender', userId] },
              then: { $arrayElemAt: ['$recipientInfo', 0] },
              else: { $arrayElemAt: ['$senderInfo', 0] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead'
          },
          otherUser: {
            _id: '$otherUser._id',
            firstName: '$otherUser.firstName',
            lastName: '$otherUser.lastName',
            profilePicture: '$otherUser.profilePicture',
            isOnline: '$otherUser.isOnline',
            lastSeen: '$otherUser.lastSeen'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    
    // Get total count for pagination
    const totalConversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $addFields: {
          conversationId: {
            $cond: {
              if: { $lt: ['$sender', '$recipient'] },
              then: { $concat: [{ $toString: '$sender' }, '_', { $toString: '$recipient' }] },
              else: { $concat: [{ $toString: '$recipient' }, '_', { $toString: '$sender' }] }
            }
          }
        }
      },
      {
        $group: {
          _id: '$conversationId'
        }
      },
      {
        $count: 'total'
      }
    ]);
    
    const total = totalConversations[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalConversations: total,
          hasNextPage: page < Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations'
    });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;
    
    // Verify the other user exists
    const otherUser = await User.findById(userId).select('firstName lastName profilePicture isOnline lastSeen');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('recipient', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Mark messages as read where current user is recipient
    await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    // Reverse to show oldest first
    messages.reverse();
    
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    });
    
    res.json({
      success: true,
      data: {
        messages,
        otherUser,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNextPage: page < Math.ceil(totalMessages / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { recipientId, content, messageType = 'text', attachments } = req.body;
    const senderId = req.user._id;
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Check if sender can message recipient (privacy settings)
    if (!recipient.privacy.allowMessages) {
      return res.status(403).json({
        success: false,
        message: 'User does not accept messages'
      });
    }
    
    const messageData = {
      sender: senderId,
      recipient: recipientId,
      content,
      messageType,
      attachments: attachments || []
    };
    
    const message = new Message(messageData);
    await message.save();
    
    // Populate sender and recipient info
    await message.populate('sender', 'firstName lastName profilePicture');
    await message.populate('recipient', 'firstName lastName profilePicture');
    
    // Emit socket event for real-time messaging
    const io = req.app.get('socketio');
    if (io) {
      // Send to recipient if they're online
      const recipientSocketId = req.app.get('userSockets')?.get(recipientId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', {
          message: message.toObject(),
          conversationId: `${Math.min(senderId, recipientId)}_${Math.max(senderId, recipientId)}`
        });
      }
      
      // Send confirmation to sender
      const senderSocketId = req.app.get('userSockets')?.get(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageSent', {
          message: message.toObject()
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }
    
    // Soft delete - mark as deleted
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
    
    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      const recipientSocketId = req.app.get('userSockets')?.get(message.recipient.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('messageDeleted', {
          messageId: messageId
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        recipient: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or already read'
      });
    }
    
    // Emit socket event to sender
    const io = req.app.get('socketio');
    if (io) {
      const senderSocketId = req.app.get('userSockets')?.get(message.sender.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageRead', {
          messageId: messageId,
          readAt: message.readAt
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
    
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

// Mark all messages in conversation as read
const markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    const result = await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`
    });
    
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read'
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { q, userId } = req.query;
    const currentUserId = req.user._id;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const filter = {
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId }
      ],
      content: { $regex: q.trim(), $options: 'i' },
      isDeleted: false
    };
    
    // If searching within specific conversation
    if (userId) {
      filter.$and = [
        {
          $or: [
            { sender: currentUserId, recipient: userId },
            { sender: userId, recipient: currentUserId }
          ]
        }
      ];
    }
    
    const messages = await Message.find(filter)
      .populate('sender', 'firstName lastName profilePicture')
      .populate('recipient', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    res.json({
      success: true,
      data: {
        messages,
        searchQuery: q.trim(),
        totalResults: messages.length
      }
    });
    
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Message search failed'
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false,
      isDeleted: false
    });
    
    res.json({
      success: true,
      data: { unreadCount }
    });
    
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Block user (prevent messages)
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }
    
    const user = await User.findById(currentUserId);
    
    if (!user.blockedUsers.includes(userId)) {
      user.blockedUsers.push(userId);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'User blocked successfully'
    });
    
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user'
    });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();
    
    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
    
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user'
    });
  }
};

// Get blocked users
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'firstName lastName profilePicture')
      .select('blockedUsers');
    
    res.json({
      success: true,
      data: { blockedUsers: user.blockedUsers }
    });
    
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked users'
    });
  }
};

// Get message analytics (for admin)
const getMessageAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const analytics = await Promise.all([
      // Total messages
      Message.countDocuments({}),
      
      // Messages today
      Message.countDocuments({
        createdAt: { $gte: startOfDay }
      }),
      
      // Messages this week
      Message.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
      
      // Messages this month
      Message.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),
      
      // Unread messages
      Message.countDocuments({
        isRead: false,
        isDeleted: false
      }),
      
      // Active conversations (with messages in last 30 days)
      Message.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $lt: ['$sender', '$recipient'] },
                then: { $concat: [{ $toString: '$sender' }, '_', { $toString: '$recipient' }] },
                else: { $concat: [{ $toString: '$recipient' }, '_', { $toString: '$sender' }] }
              }
            }
          }
        },
        {
          $count: 'activeConversations'
        }
      ])
    ]);
    
    const [
      totalMessages,
      messagesToday,
      messagesThisWeek,
      messagesThisMonth,
      unreadMessages,
      activeConversationsResult
    ] = analytics;
    
    const activeConversations = activeConversationsResult[0]?.activeConversations || 0;
    
    res.json({
      success: true,
      data: {
        totalMessages,
        messagesToday,
        messagesThisWeek,
        messagesThisMonth,
        unreadMessages,
        activeConversations
      }
    });
    
  } catch (error) {
    console.error('Get message analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get message analytics'
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  markConversationAsRead,
  searchMessages,
  getUnreadCount,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getMessageAnalytics
};