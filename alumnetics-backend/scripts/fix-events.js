// Fix script - Update admin user and approve all events
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://realadityakumar:Real%40aditya1@cluster0.vfaer.mongodb.net/alumnetics?retryWrites=true&w=majority';

async function fixData() {
    try {
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Event = require('../src/models/Event');
        const User = require('../src/models/User');

        // 1. Update admin user with institution
        console.log('🔧 Fixing admin user...');
        const adminUpdate = await User.findOneAndUpdate(
            { email: 'admin@university1.edu' },
            {
                $set: {
                    fullName: 'Admin User',
                    'institution.name': 'University1',
                    degree: 'Administration',
                    graduationYear: 2020,
                    isVerified: true
                }
            },
            { new: true }
        );

        if (adminUpdate) {
            console.log('✅ Admin user updated:');
            console.log('   Email:', adminUpdate.email);
            console.log('   Institution:', adminUpdate.institution?.name);
        } else {
            console.log('❌ Admin user not found!');
        }

        // 2. Approve all events and set institution
        console.log('\n🔧 Approving and fixing all events...');
        const eventsUpdate = await Event.updateMany(
            {},
            {
                $set: {
                    isApproved: true,
                    status: 'published',
                    institution: 'University1'
                }
            }
        );
        console.log(`✅ Updated ${eventsUpdate.modifiedCount} events`);

        // 3. Check if student user exists, if not create one
        console.log('\n🔧 Checking student user...');
        let studentUser = await User.findOne({ email: 'student@university1.edu' });
        
        if (!studentUser) {
            console.log('Creating new student user...');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('Student@123', 10);
            
            studentUser = new User({
                email: 'student@university1.edu',
                password: hashedPassword,
                role: 'student',
                fullName: 'John Student',
                institution: {
                    name: 'University1',
                    type: 'university',
                    location: 'City'
                },
                degree: 'Computer Science',
                graduationYear: 2026,
                department: 'Software Engineering',
                isVerified: true
            });
            
            await studentUser.save();
            console.log('✅ Student user created!');
        } else {
            // Update existing student
            studentUser = await User.findOneAndUpdate(
                { email: 'student@university1.edu' },
                {
                    $set: {
                        fullName: 'John Student',
                        'institution.name': 'University1',
                        degree: 'Computer Science',
                        graduationYear: 2026,
                        isVerified: true
                    }
                },
                { new: true }
            );
            console.log('✅ Student user updated!');
        }
        
        console.log('   Email:', studentUser.email);
        console.log('   Role:', studentUser.role);
        console.log('   Institution:', studentUser.institution?.name);

        // 4. Verify the fixes
        console.log('\n📊 Verifying fixes...');
        const allEvents = await Event.find({});
        console.log(`\nTotal events: ${allEvents.length}`);
        allEvents.forEach((event, index) => {
            console.log(`\n  ${index + 1}. ${event.title}`);
            console.log('     Status:', event.status);
            console.log('     Approved:', event.isApproved);
            console.log('     Institution:', event.institution);
        });

        const visibleToStudent = await Event.find({
            status: 'published',
            isApproved: true,
            institution: 'University1'
        });
        console.log(`\n✅ Events visible to student: ${visibleToStudent.length}`);

        console.log('\n\n🎉 ALL FIXES APPLIED!\n');
        console.log('You can now:');
        console.log('1. Login as admin: admin@university1.edu / Admin@123');
        console.log('2. Login as student: student@university1.edu / Student@123');
        console.log('3. Student should now see the approved events!\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed\n');
    }
}

fixData();
