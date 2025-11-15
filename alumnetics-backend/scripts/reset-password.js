const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

async function resetPassword(email, newPassword) {
  try {
    console.log('\n🔄 Resetting password for:', email);
    console.log('🔄 New password:', newPassword);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('✅ User found:', user.fullName);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Get email and password from command line
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node reset-password.js <email> <new-password>');
  console.log('Example: node reset-password.js user@example.com newpass123');
  process.exit(1);
}

resetPassword(email, newPassword);
