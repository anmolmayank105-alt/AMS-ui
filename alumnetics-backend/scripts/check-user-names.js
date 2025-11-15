const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

async function checkUserNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB');

    // Find all users and check their names
    const users = await User.find({}).select('_id email firstName lastName role');
    
    console.log(`\n📊 Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      const hasName = user.firstName && user.lastName;
      const status = hasName ? '✅' : '❌';
      
      console.log(`${index + 1}. ${status} ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   First Name: "${user.firstName || 'MISSING'}"`);
      console.log(`   Last Name: "${user.lastName || 'MISSING'}"`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    const usersWithoutNames = users.filter(u => !u.firstName || !u.lastName);
    
    if (usersWithoutNames.length > 0) {
      console.log(`\n⚠️  ${usersWithoutNames.length} user(s) missing first/last name`);
      console.log('These users need to be fixed!\n');
    } else {
      console.log('\n✅ All users have first and last names!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

checkUserNames();
