const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adityakumar6658:MINlLR6oSBBpZBSP@cluster0.bkpee.mongodb.net/alumnetics?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

const User = require('../src/models/User');

async function resetPassword() {
    try {
        console.log('\n🔍 Finding student user...');
        const student = await User.findOne({ email: 'student@university1.edu' });
        
        if (!student) {
            console.log('❌ Student user not found!');
            process.exit(1);
        }
        
        console.log('✅ Found student:', student.email);
        console.log('Current role:', student.role);
        console.log('Current institution:', student.institution?.name);
        
        // Reset password
        const newPassword = 'p11348456';
        student.password = newPassword; // Will be hashed by pre-save hook
        await student.save();
        
        console.log('\n✅ Password reset successfully!');
        console.log('📧 Email: student@university1.edu');
        console.log('🔑 Password: p11348456');
        
        // Test the password
        const isValid = await student.comparePassword(newPassword);
        console.log('🧪 Password validation test:', isValid ? '✅ PASS' : '❌ FAIL');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

resetPassword();
