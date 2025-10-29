// Quick script to verify admin user's email in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adityakumar6658:MINlLR6oSBBpZBSP@cluster0.bkpee.mongodb.net/alumnetics?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define User schema (minimal)
const userSchema = new mongoose.Schema({
  email: String,
  emailVerified: Boolean,
  role: String,
  fullName: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function verifyAdminEmail() {
  try {
    console.log('🔍 Looking for admin users...\n');
    
    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database');
      return;
    }
    
    console.log(`📋 Found ${admins.length} admin user(s):\n`);
    
    // Update each admin user
    for (const admin of admins) {
      console.log(`👤 Admin: ${admin.fullName} (${admin.email})`);
      console.log(`   Email Verified: ${admin.emailVerified ? '✅ Yes' : '❌ No'}`);
      
      if (!admin.emailVerified) {
        console.log(`   🔄 Updating email verification status...`);
        admin.emailVerified = true;
        await admin.save();
        console.log(`   ✅ Email verified successfully!\n`);
      } else {
        console.log(`   ℹ️  Already verified\n`);
      }
    }
    
    console.log('✅ All admin users have been verified!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the function
verifyAdminEmail();
