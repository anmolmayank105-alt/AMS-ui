const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Participants
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message Content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxLength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'link'],
    default: 'text'
  },
  
  // File attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    publicId: String
  }],
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Threading (for replies)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message flags
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Conversation Schema for group messages
const conversationSchema = new mongoose.Schema({
  title: String,
  description: String,
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    lastReadAt: Date
  }],
  
  // Group settings
  isGroup: {
    type: Boolean,
    default: false
  },
  groupSettings: {
    allowMemberAdd: {
      type: Boolean,
      default: true
    },
    allowMemberLeave: {
      type: Boolean,
      default: true
    },
    onlyAdminCanMessage: {
      type: Boolean,
      default: false
    }
  },
  
  // Last message reference
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Group media
  groupImage: {
    url: String,
    publicId: String
  },
  
  // Status
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add conversation reference to message
messageSchema.add({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  }
});

// Indexes for Message
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

// Indexes for Conversation
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ isGroup: 1 });

// Virtual for unread count in conversation
conversationSchema.virtual('unreadCount').get(function() {
  // This would need to be calculated in the query
  return 0;
});

// Method to add participant to conversation
conversationSchema.methods.addParticipant = function(userId, role = 'member') {
  const exists = this.participants.some(
    p => p.user.toString() === userId.toString()
  );
  
  if (!exists) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to remove participant from conversation
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString()
  );
};

// Method to update last read timestamp
conversationSchema.methods.updateLastRead = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to create or get direct conversation
conversationSchema.statics.findOrCreateDirectConversation = async function(user1Id, user2Id) {
  let conversation = await this.findOne({
    isGroup: false,
    $and: [
      { 'participants.user': user1Id },
      { 'participants.user': user2Id }
    ]
  });
  
  if (!conversation) {
    conversation = await this.create({
      participants: [
        { user: user1Id, role: 'member' },
        { user: user2Id, role: 'member' }
      ],
      isGroup: false,
      createdBy: user1Id
    });
  }
  
  return conversation;
};

// Pre-save middleware for message to update conversation
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      await mongoose.model('Conversation').findByIdAndUpdate(
        this.conversation,
        {
          lastMessage: this._id,
          lastActivity: this.createdAt || new Date()
        }
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
  next();
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from user
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  if (this.content !== newContent) {
    this.editHistory.push({
      content: this.content
    });
    this.content = newContent;
    this.isEdited = true;
  }
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = {
  Message,
  Conversation
};