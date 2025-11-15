const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const { Message, Conversation } = require('../src/models/Message');

async function testMessagingAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check if users have firstName/lastName
    console.log('📋 TEST 1: Check User Schema');
    const sampleUser = await User.findOne({}).select('firstName lastName email fullName');
    if (!sampleUser) {
      console.log('❌ No users in database');
      return;
    }
    console.log(`Sample user: ${sampleUser.email}`);
    console.log(`  firstName: "${sampleUser.firstName || 'MISSING'}"`);
    console.log(`  lastName: "${sampleUser.lastName || 'MISSING'}"`);
    console.log(`  fullName: "${sampleUser.fullName}"`);
    
    if (!sampleUser.firstName || !sampleUser.lastName) {
      console.log('⚠️  WARNING: User missing firstName/lastName fields!\n');
    } else {
      console.log('✅ User has firstName and lastName\n');
    }

    // 2. Check Message model
    console.log('📋 TEST 2: Check Message Model');
    const messageCount = await Message.countDocuments();
    console.log(`Total messages in database: ${messageCount}`);
    
    if (messageCount > 0) {
      const recentMessage = await Message.findOne()
        .sort({ createdAt: -1 })
        .populate('sender', 'firstName lastName email')
        .populate('recipient', 'firstName lastName email')
        .lean();
      
      console.log('\nMost recent message:');
      console.log(`  From: ${recentMessage.sender?.firstName} ${recentMessage.sender?.lastName} (${recentMessage.sender?.email})`);
      console.log(`  To: ${recentMessage.recipient?.firstName} ${recentMessage.recipient?.lastName} (${recentMessage.recipient?.email})`);
      console.log(`  Content: "${recentMessage.content}"`);
      console.log(`  Conversation: ${recentMessage.conversation}`);
      console.log(`  Created: ${recentMessage.createdAt}`);
    } else {
      console.log('ℹ️  No messages in database yet');
    }

    // 3. Check Conversation model
    console.log('\n📋 TEST 3: Check Conversation Model');
    const conversationCount = await Conversation.countDocuments();
    console.log(`Total conversations: ${conversationCount}`);
    
    if (conversationCount > 0) {
      const conversations = await Conversation.find()
        .populate('participants.user', 'firstName lastName email')
        .limit(3)
        .lean();
      
      console.log('\nSample conversations:');
      conversations.forEach((conv, i) => {
        console.log(`\n${i + 1}. Conversation ${conv._id}`);
        console.log(`   Is Group: ${conv.isGroup}`);
        console.log(`   Participants:`);
        conv.participants.forEach(p => {
          console.log(`     - ${p.user?.firstName} ${p.user?.lastName} (${p.user?.email})`);
        });
        console.log(`   Last Activity: ${conv.lastActivity}`);
      });
    } else {
      console.log('ℹ️  No conversations in database yet');
    }

    // 4. Test conversation creation logic
    console.log('\n📋 TEST 4: Test Conversation Creation');
    const users = await User.find().limit(2).select('_id firstName lastName email');
    
    if (users.length < 2) {
      console.log('⚠️  Need at least 2 users to test conversation creation');
    } else {
      console.log(`Testing with:`);
      console.log(`  User 1: ${users[0].firstName} ${users[0].lastName} (${users[0]._id})`);
      console.log(`  User 2: ${users[1].firstName} ${users[1].lastName} (${users[1]._id})`);
      
      try {
        const conv = await Conversation.findOrCreateDirectConversation(
          users[0]._id,
          users[1]._id
        );
        console.log(`✅ Conversation created/found: ${conv._id}`);
        console.log(`   Participants: ${conv.participants.length}`);
        console.log(`   Is Group: ${conv.isGroup}`);
      } catch (error) {
        console.log(`❌ Conversation creation failed: ${error.message}`);
      }
    }

    // 5. Check for potential issues
    console.log('\n📋 TEST 5: Check for Issues');
    
    // Check messages without conversations
    const messagesWithoutConv = await Message.countDocuments({ 
      conversation: { $exists: false } 
    });
    if (messagesWithoutConv > 0) {
      console.log(`⚠️  ${messagesWithoutConv} messages without conversation reference!`);
    } else {
      console.log('✅ All messages have conversation references');
    }

    // Check users without names
    const usersWithoutNames = await User.countDocuments({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null },
        { firstName: '' },
        { lastName: '' }
      ]
    });
    
    if (usersWithoutNames > 0) {
      console.log(`⚠️  ${usersWithoutNames} users without firstName/lastName!`);
    } else {
      console.log('✅ All users have firstName and lastName');
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testMessagingAPI();
