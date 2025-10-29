// Test script to check events in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://realadityakumar:Real%40aditya1@cluster0.vfaer.mongodb.net/alumnetics?retryWrites=true&w=majority';

async function testEvents() {
    try {
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Import models
        const Event = require('../src/models/Event');
        const User = require('../src/models/User');

        // Check all events
        console.log('📊 Checking all events in database...');
        const allEvents = await Event.find({}).populate('organizer', 'email firstName lastName academic');
        console.log(`\nTotal events in database: ${allEvents.length}\n`);

        if (allEvents.length > 0) {
            allEvents.forEach((event, index) => {
                console.log(`\n--- Event ${index + 1} ---`);
                console.log('Title:', event.title);
                console.log('ID:', event._id);
                console.log('Status:', event.status);
                console.log('Approved:', event.isApproved);
                console.log('Institution:', event.institution);
                console.log('Organizer Email:', event.organizer?.email);
                console.log('Organizer Institution:', event.organizer?.institution?.name);
                console.log('Is Virtual:', event.isVirtual);
                console.log('Start Date:', event.startDate);
                console.log('Attendees:', event.attendees?.length || 0);
                console.log('Created:', event.createdAt);
            });
        } else {
            console.log('❌ No events found in database!');
        }

        // Check admin user
        console.log('\n\n📊 Checking admin user...');
        const adminUser = await User.findOne({ email: 'admin@university1.edu' });
        if (adminUser) {
            console.log('\nAdmin User Found:');
            console.log('Email:', adminUser.email);
            console.log('Role:', adminUser.role);
            console.log('Institution:', adminUser.institution?.name);
            console.log('Full Name:', adminUser.fullName);
        } else {
            console.log('❌ Admin user not found!');
        }

        // Check student user
        console.log('\n\n📊 Checking student user...');
        const studentUser = await User.findOne({ email: 'student@university1.edu' });
        if (studentUser) {
            console.log('\nStudent User Found:');
            console.log('Email:', studentUser.email);
            console.log('Role:', studentUser.role);
            console.log('Institution:', studentUser.institution?.name);
            console.log('Full Name:', studentUser.fullName);
        } else {
            console.log('❌ Student user not found!');
        }

        // Check published and approved events for student's institution
        if (studentUser && studentUser.institution?.name) {
            console.log('\n\n📊 Checking events visible to student...');
            const visibleEvents = await Event.find({
                status: 'published',
                isApproved: true,
                institution: studentUser.institution.name
            });
            console.log(`\nEvents student should see: ${visibleEvents.length}`);
            if (visibleEvents.length > 0) {
                visibleEvents.forEach((event, index) => {
                    console.log(`\n  ${index + 1}. ${event.title}`);
                    console.log('     Status:', event.status);
                    console.log('     Approved:', event.isApproved);
                    console.log('     Institution:', event.institution);
                });
            }
        }

        console.log('\n\n✅ Database check complete!\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed\n');
    }
}

testEvents();
