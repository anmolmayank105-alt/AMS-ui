const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const testSearch = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get the email from command line
    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node test-search.js <your-email>');
      process.exit(1);
    }
    
    // Find the current user
    const currentUser = await User.findOne({ email: email.toLowerCase() }).select('fullName email role institution');
    
    if (!currentUser) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }
    
    console.log('👤 Current User:');
    console.log(`   Name: ${currentUser.fullName}`);
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Role: ${currentUser.role}`);
    console.log(`   Institution: ${currentUser.institution?.name || 'NOT SET'}`);
    
    const userInstitution = currentUser.institution?.name;
    
    if (!userInstitution) {
      console.log('\n⚠️  WARNING: User has no institution set!');
      console.log('   This user will not be able to search for others.');
      process.exit(1);
    }
    
    console.log('\n🔍 Searching for users from the same institution...\n');
    
    // Simulate the search query
    const searchQuery = {
      $and: [
        { 
          $or: [
            { isActive: true },
            { isActive: { $exists: false } }
          ]
        },
        { 'institution.name': userInstitution }
      ]
    };
    
    console.log('Search Query:', JSON.stringify(searchQuery, null, 2));
    
    const users = await User.find(searchQuery)
      .select('fullName email role institution')
      .lean();
    
    console.log(`\n📊 Found ${users.length} users from "${userInstitution}":\n`);
    
    users.forEach(user => {
      console.log(`   ${user.fullName} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Institution: "${user.institution?.name}"`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('⚠️  No users found! Checking for similar institution names...\n');
      
      const allInstitutions = await User.distinct('institution.name');
      console.log('All institutions in database:');
      allInstitutions.forEach(inst => {
        if (inst) {
          console.log(`   "${inst}" (length: ${inst.length}, trimmed: "${inst.trim()}")`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
};

testSearch();
