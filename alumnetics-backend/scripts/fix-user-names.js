const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

async function fixUserNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB');

    // Find all users without names
    const users = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null },
        { firstName: '' },
        { lastName: '' }
      ]
    });

    console.log(`\n🔍 Found ${users.length} users without proper names\n`);

    let fixed = 0;

    for (const user of users) {
      // Extract name from email (before @)
      const emailPart = user.email.split('@')[0];
      
      // Convert to proper case (capitalize first letter)
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
      
      // Split by dots, underscores, or numbers
      const parts = emailPart.split(/[._0-9]+/).filter(p => p.length > 0);
      
      let firstName, lastName;
      
      if (parts.length >= 2) {
        firstName = capitalize(parts[0]);
        lastName = capitalize(parts[1]);
      } else if (parts.length === 1) {
        firstName = capitalize(parts[0]);
        lastName = 'User';
      } else {
        firstName = 'User';
        lastName = user._id.toString().slice(-4);
      }

      // Update user
      user.firstName = firstName;
      user.lastName = lastName;
      await user.save();

      console.log(`✅ Fixed: ${user.email}`);
      console.log(`   → ${firstName} ${lastName}\n`);
      fixed++;
    }

    console.log(`\n🎉 Fixed ${fixed} users!\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixUserNames();
