require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');

async function checkEvents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find({ institution: 'Netaji Subhas Engineering College' });
        
        console.log('\n=== NETAJI EVENTS ===');
        console.log(`Found ${events.length} events\n`);

        events.forEach(event => {
            console.log(`Title: ${event.title}`);
            console.log(`Event Type: ${event.eventType}`);
            console.log(`Cover Image: ${JSON.stringify(event.coverImage)}`);
            console.log(`Image URL: ${event.imageUrl}`);
            console.log(`Has coverImage field: ${event.coverImage !== undefined}`);
            console.log(`Has imageUrl field: ${event.imageUrl !== undefined}`);
            console.log(`coverImage value: ${event.coverImage}`);
            console.log('---\n');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkEvents();
