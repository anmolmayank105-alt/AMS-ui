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
const Event = require('../src/models/Event');

async function checkUser() {
    try {
        console.log('\n🔍 Checking user: anmolmayank6@gmail.com');
        const user = await User.findOne({ email: 'anmolmayank6@gmail.com' });
        
        if (!user) {
            console.log('❌ User NOT found in database!');
            console.log('\n💡 This user needs to be registered first.');
            process.exit(1);
        }
        
        console.log('\n✅ User found!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', user.email);
        console.log('👤 Name:', user.fullName);
        console.log('🎓 Role:', user.role);
        console.log('🏫 Institution:', user.institution?.name || 'NOT SET ❌');
        console.log('✅ Email Verified:', user.emailVerified || false);
        console.log('📊 Status:', user.status);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Check password validation
        const isPasswordCorrect = await user.comparePassword('p11348456');
        console.log('\n🔑 Password check:', isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT');
        
        // Check events for this user
        console.log('\n\n📊 Checking events visible to this user...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (!user.institution?.name) {
            console.log('⚠️  USER HAS NO INSTITUTION SET!');
            console.log('⚠️  User will NOT see any events!');
            console.log('\n💡 Solution: Set institution for this user');
        } else {
            const events = await Event.find({
                status: 'published',
                isApproved: true,
                institution: user.institution.name
            });
            
            console.log(`\n✅ Events found: ${events.length}`);
            
            if (events.length > 0) {
                events.forEach((event, index) => {
                    console.log(`\n${index + 1}. ${event.title}`);
                    console.log(`   Institution: ${event.institution}`);
                    console.log(`   Status: ${event.status}`);
                    console.log(`   Approved: ${event.isApproved}`);
                });
            } else {
                console.log('⚠️  No events match this user\'s institution');
                
                // Check all events
                const allEvents = await Event.find({ status: 'published', isApproved: true });
                console.log(`\n📊 Total published events in database: ${allEvents.length}`);
                if (allEvents.length > 0) {
                    console.log('\nInstitutions with events:');
                    const institutions = [...new Set(allEvents.map(e => e.institution))];
                    institutions.forEach(inst => {
                        const count = allEvents.filter(e => e.institution === inst).length;
                        console.log(`   - ${inst}: ${count} event(s)`);
                    });
                }
            }
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed\n');
    }
}

checkUser();
