const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

async function fixMissingNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB\n');

    // Find users without firstName/lastName
    const usersWithoutNames = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null },
        { firstName: '' },
        { lastName: '' }
      ]
    }).select('email fullName firstName lastName');

    console.log(`Found ${usersWithoutNames.length} users without firstName/lastName:\n`);

    for (const user of usersWithoutNames) {
      console.log(`User: ${user.email}`);
      console.log(`  Current fullName: "${user.fullName}"`);
      console.log(`  Current firstName: "${user.firstName || 'MISSING'}"`);
      console.log(`  Current lastName: "${user.lastName || 'MISSING'}"`);

      // Generate from email if fullName is missing
      let firstName, lastName;
      
      if (user.fullName && user.fullName.trim()) {
        const names = user.fullName.trim().split(' ');
        firstName = names[0];
        lastName = names.length > 1 ? names.slice(1).join(' ') : 'User';
      } else {
        // Generate from email
        const emailPart = user.email.split('@')[0];
        const capitalizedEmail = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
        firstName = capitalizedEmail;
        lastName = 'User';
      }

      // Update user
      user.firstName = firstName;
      user.lastName = lastName;
      await user.save();

      console.log(`  ✅ Updated to: ${firstName} ${lastName}\n`);
    }

    // Verify all users now have names
    const remainingWithoutNames = await User.countDocuments({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null },
        { firstName: '' },
        { lastName: '' }
      ]
    });

    if (remainingWithoutNames === 0) {
      console.log('✅ All users now have firstName and lastName!');
    } else {
      console.log(`⚠️  Still ${remainingWithoutNames} users without names`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixMissingNames();
