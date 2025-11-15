const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const fixInstitutionNames = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all users with institution names that have leading/trailing spaces
    const users = await User.find({ 'institution.name': { $exists: true } });
    
    console.log(`📊 Found ${users.length} users with institutions\n`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      if (user.institution && user.institution.name) {
        const originalName = user.institution.name;
        const trimmedName = originalName.trim();
        
        if (originalName !== trimmedName) {
          console.log(`🔧 Fixing: "${originalName}" → "${trimmedName}"`);
          console.log(`   User: ${user.fullName} (${user.email})`);
          
          user.institution.name = trimmedName;
          await user.save();
          fixedCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} institution names`);
    } else {
      console.log('✅ No institution names needed fixing');
    }
    
    // Show updated groups
    console.log('\n🏫 Updated institution groups:');
    const updatedUsers = await User.find({}).select('institution').lean();
    const institutionCounts = {};
    updatedUsers.forEach(user => {
      const instName = user.institution?.name || 'NO INSTITUTION';
      institutionCounts[instName] = (institutionCounts[instName] || 0) + 1;
    });
    
    Object.keys(institutionCounts).sort().forEach(instName => {
      console.log(`   ${instName}: ${institutionCounts[instName]} users`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
};

fixInstitutionNames();
