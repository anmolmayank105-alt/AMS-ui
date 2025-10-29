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
const Event = require('../src/models/Event');

async function setupNetajiEvents() {
    try {
        console.log('\n🎯 Setting up events for Netaji Subhas Engineering College');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 1. Find or create admin for Netaji
        console.log('\n1️⃣  Checking/Creating admin for Netaji...');
        let netajiAdmin = await User.findOne({ 
            email: 'admin@netaji.edu',
            role: 'admin'
        });
        
        if (!netajiAdmin) {
            console.log('Creating new admin for Netaji...');
            const hashedPassword = await bcrypt.hash('p11348456', 10);
            
            netajiAdmin = new User({
                fullName: 'Netaji Admin',
                email: 'admin@netaji.edu',
                password: hashedPassword,
                role: 'admin',
                institution: {
                    name: 'Netaji Subhas Engineering College',
                    type: 'university'
                },
                status: 'approved',
                emailVerified: true
            });
            await netajiAdmin.save();
            console.log('✅ Admin created for Netaji Subhas Engineering College');
        } else {
            console.log('✅ Admin already exists for Netaji');
        }
        
        // 2. Verify user anmolmayank6@gmail.com
        console.log('\n2️⃣  Checking user anmolmayank6@gmail.com...');
        const student = await User.findOne({ email: 'anmolmayank6@gmail.com' });
        
        if (student) {
            console.log('✅ User found:');
            console.log('   Name:', student.fullName);
            console.log('   Institution:', student.institution?.name);
            console.log('   Role:', student.role);
            
            // Update status to approved if pending
            if (student.status === 'pending') {
                student.status = 'approved';
                await student.save();
                console.log('✅ User status updated to approved');
            }
        } else {
            console.log('❌ User not found');
        }
        
        // 3. Create events for Netaji Subhas Engineering College
        console.log('\n3️⃣  Creating events for Netaji Subhas Engineering College...');
        
        const netajiEvents = [
            {
                title: 'Netaji Tech Fest 2025',
                description: 'Annual technical festival showcasing innovation and creativity. Join us for workshops, competitions, and networking opportunities.',
                eventType: 'workshop',
                startDate: new Date('2025-11-20T09:00:00.000Z'),
                endDate: new Date('2025-11-22T18:00:00.000Z'),
                venue: {
                    name: 'Netaji Main Campus',
                    city: 'Kolkata',
                    state: 'West Bengal',
                    country: 'India'
                },
                isVirtual: false,
                organizer: netajiAdmin._id,
                institution: 'Netaji Subhas Engineering College',
                maxAttendees: 500,
                status: 'published',
                isApproved: true,
                category: 'academic'
            },
            {
                title: 'Alumni Networking Meetup',
                description: 'Connect with fellow alumni and current students. Share experiences, insights, and career opportunities.',
                eventType: 'networking',
                startDate: new Date('2025-12-05T17:00:00.000Z'),
                endDate: new Date('2025-12-05T20:00:00.000Z'),
                venue: {
                    name: 'Netaji Auditorium',
                    city: 'Kolkata',
                    state: 'West Bengal',
                    country: 'India'
                },
                isVirtual: false,
                organizer: netajiAdmin._id,
                institution: 'Netaji Subhas Engineering College',
                maxAttendees: 200,
                status: 'published',
                isApproved: true,
                category: 'social'
            },
            {
                title: 'Career Guidance Workshop',
                description: 'Expert guidance on career paths, interview preparation, and industry insights from successful alumni.',
                eventType: 'seminar',
                startDate: new Date('2025-11-30T14:00:00.000Z'),
                endDate: new Date('2025-11-30T17:00:00.000Z'),
                venue: {
                    name: 'Conference Hall',
                    city: 'Kolkata'
                },
                isVirtual: false,
                organizer: netajiAdmin._id,
                institution: 'Netaji Subhas Engineering College',
                maxAttendees: 150,
                status: 'published',
                isApproved: true,
                category: 'professional'
            }
        ];
        
        // Check and create events
        for (const eventData of netajiEvents) {
            const exists = await Event.findOne({ 
                title: eventData.title,
                institution: 'Netaji Subhas Engineering College'
            });
            
            if (!exists) {
                const event = new Event(eventData);
                await event.save();
                console.log(`✅ Created: ${event.title}`);
            } else {
                console.log(`⏭️  Already exists: ${eventData.title}`);
            }
        }
        
        // 4. Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const netajiEventsCount = await Event.countDocuments({ 
            institution: 'Netaji Subhas Engineering College',
            status: 'published',
            isApproved: true
        });
        
        const university1EventsCount = await Event.countDocuments({ 
            institution: 'University1',
            status: 'published',
            isApproved: true
        });
        
        console.log(`\n✅ Events for Netaji Subhas Engineering College: ${netajiEventsCount}`);
        console.log(`✅ Events for University1: ${university1EventsCount}`);
        
        console.log('\n👥 Admin Accounts:');
        console.log('   • admin@netaji.edu → Netaji Subhas Engineering College');
        console.log('   • admin@university1.edu → University1');
        
        console.log('\n👤 Student Accounts:');
        console.log('   • anmolmayank6@gmail.com → Netaji Subhas Engineering College');
        console.log('   • student@university1.edu → University1');
        
        console.log('\n🎯 Login Credentials:');
        console.log('   📧 Email: anmolmayank6@gmail.com');
        console.log('   🔑 Password: p11348456');
        console.log('   🏫 Institution: Netaji Subhas Engineering College');
        console.log(`   📅 Will see: ${netajiEventsCount} event(s)`);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Setup complete! Now test the student dashboard.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed\n');
    }
}

setupNetajiEvents();
