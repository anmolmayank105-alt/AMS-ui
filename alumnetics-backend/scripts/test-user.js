const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

async function testUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'anmolmayank7@gmail.com' });
    
    console.log('\n📋 Full user object:');
    console.log(JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testUser();
