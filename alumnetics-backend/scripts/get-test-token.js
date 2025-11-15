const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('../src/models/User');

async function getTestToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB\n');

    // Get a test user
    const user = await User.findOne({ email: 'anmolmayank6@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`User ID: ${user._id}`);
    console.log(`Role: ${user.role}\n`);

    // Generate token (same way as backend)
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    console.log('Generated Auth Token:');
    console.log(token);
    console.log('\n📋 Test commands:');
    console.log('\n1. Get Conversations:');
    console.log(`curl -Method GET -Uri 'http://localhost:5000/api/messages/conversations' -Headers @{Authorization='Bearer ${token}'} -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json -Depth 10`);
    
    console.log('\n2. Get Messages with specific user (replace USER_ID):');
    console.log(`curl -Method GET -Uri 'http://localhost:5000/api/messages/USER_ID' -Headers @{Authorization='Bearer ${token}'} -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json -Depth 10`);
    
    console.log('\n3. Send Message (replace RECIPIENT_ID):');
    console.log(`$body = @{recipientId='RECIPIENT_ID'; content='Test message from API'} | ConvertTo-Json; curl -Method POST -Uri 'http://localhost:5000/api/messages' -Headers @{Authorization='Bearer ${token}'; 'Content-Type'='application/json'} -Body $body -UseBasicParsing`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

getTestToken();
