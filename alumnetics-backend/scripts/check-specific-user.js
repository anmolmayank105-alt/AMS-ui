const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adityakumar6658:MINlLR6oSBBpZBSP@cluster0.bkpee.mongodb.net/alumnetics?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

const User = require('../src/models/User');

async function checkUser() {
    try {
        // Get email from command line argument
        const email = process.argv[2] || 'anmol2@gmai.com';
        
        console.log(`\n🔍 Checking user: ${email}`);
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ User NOT found in database!');
            process.exit(1);
        }
        
        console.log('\n✅ User found!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', user.email);
        console.log('👤 Full Name:', user.fullName);
        console.log('🎓 Role:', user.role);
        console.log('🏫 Institution:', JSON.stringify(user.institution, null, 2));
        console.log('📱 Phone:', user.phone || 'NOT SET');
        console.log('🎓 Department:', user.department || 'NOT SET');
        console.log('🎓 Degree:', user.degree || 'NOT SET');
        console.log('📅 Graduation Year:', user.graduationYear || 'NOT SET');
        console.log('📝 Bio:', user.bio || 'NOT SET');
        console.log('🎯 Skills:', user.skills || []);
        console.log('❤️  Interests:', user.interests || []);
        console.log('🎓 Education:', JSON.stringify(user.education, null, 2));
        console.log('💼 Projects:', JSON.stringify(user.projects, null, 2));
        console.log('🏆 Achievements:', JSON.stringify(user.achievements, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed\n');
    }
}

checkUser();
