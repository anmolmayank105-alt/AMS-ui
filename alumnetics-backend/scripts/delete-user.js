const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

async function deleteUser(email) {
  try {
    console.log('\n🗑️  Deleting user:', email);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log('   Name:', user.fullName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Created:', user.createdAt);
    
    // Delete user
    await User.deleteOne({ email: email.toLowerCase() });
    
    console.log('\n✅ User deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: node delete-user.js <email>');
  console.log('Example: node delete-user.js user@example.com');
  process.exit(1);
}

deleteUser(email);
