// Auto-approve all events script
// Run this whenever you create a new event and want it to be visible to students immediately

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://realadityakumar:Real%40aditya1@cluster0.vfaer.mongodb.net/alumnetics?retryWrites=true&w=majority';

async function autoApproveEvents() {
    try {
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const Event = require('../src/models/Event');

        // Approve all unapproved events
        const result = await Event.updateMany(
            { isApproved: false },
            { $set: { isApproved: true, status: 'published' } }
        );

        console.log(`✅ Approved ${result.modifiedCount} events\n`);

        // Show all events
        const allEvents = await Event.find({}).select('title status isApproved institution');
        console.log('All events:');
        allEvents.forEach((e, i) => {
            console.log(`${i + 1}. ${e.title} - ${e.status} - Approved: ${e.isApproved} - ${e.institution}`);
        });
        
        console.log('\n✅ Done!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

autoApproveEvents();
