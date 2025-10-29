require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const email = 'anmolmayank6@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('📋 User Details:');
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Institution: ${user.institution}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  ID: ${user._id}`);

        if (user.role !== 'admin') {
            console.log('\n⚠️  User is NOT an admin. Changing role to admin...');
            user.role = 'admin';
            await user.save();
            console.log('✅ User role updated to admin!');
        } else {
            console.log('\n✅ User is already an admin');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUser();
