const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const checkInstitutions = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all users with their institution names
    const users = await User.find({})
      .select('fullName email role institution')
      .lean();
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    // Group by institution name
    const institutionGroups = {};
    users.forEach(user => {
      const instName = user.institution?.name || 'NO INSTITUTION';
      if (!institutionGroups[instName]) {
        institutionGroups[instName] = [];
      }
      institutionGroups[instName].push({
        name: user.fullName,
        email: user.email,
        role: user.role
      });
    });
    
    console.log('🏫 Users grouped by institution:\n');
    Object.keys(institutionGroups).forEach(instName => {
      console.log(`\n📍 ${instName} (${institutionGroups[instName].length} users):`);
      institutionGroups[instName].forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 Summary:');
    Object.keys(institutionGroups).forEach(instName => {
      console.log(`   ${instName}: ${institutionGroups[instName].length} users`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
};

checkInstitutions();
