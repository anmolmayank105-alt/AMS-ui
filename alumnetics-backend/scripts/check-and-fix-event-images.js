const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('../src/models/Event');

async function checkAndFixEventImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all events
        const events = await Event.find({});
        console.log(`\n📊 Found ${events.length} events\n`);

        for (const event of events) {
            console.log(`Event: ${event.title}`);
            console.log(`  Institution: ${event.institution}`);
            console.log(`  Event Type: ${event.eventType}`);
            console.log(`  Cover Image: ${JSON.stringify(event.coverImage)}`);
            console.log(`  Image URL: ${event.imageUrl}`);
            
            // Remove any existing image fields to allow default images
            if (event.coverImage || event.imageUrl) {
                console.log(`  🔧 Removing existing image fields...`);
                event.coverImage = undefined;
                event.imageUrl = undefined;
                await event.save();
                console.log(`  ✅ Image fields cleared`);
            } else {
                console.log(`  ℹ️  No image fields to clear`);
            }
            console.log('---\n');
        }

        console.log('✅ All events checked and updated');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndFixEventImages();
