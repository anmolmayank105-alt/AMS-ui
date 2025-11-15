const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const checkInstitutionFormat = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const users = await User.find({ 'institution.name': { $exists: true } })
      .select('fullName email institution')
      .lean();
    
    console.log('🏫 Checking institution name formats:\n');
    
    const institutionDetails = {};
    
    users.forEach(user => {
      const instName = user.institution?.name;
      if (instName) {
        if (!institutionDetails[instName]) {
          institutionDetails[instName] = {
            exact: instName,
            length: instName.length,
            trimmed: instName.trim(),
            trimmedLength: instName.trim().length,
            hasPadding: instName !== instName.trim(),
            lowercase: instName.toLowerCase(),
            users: []
          };
        }
        institutionDetails[instName].users.push({
          name: user.fullName,
          email: user.email
        });
      }
    });
    
    Object.keys(institutionDetails).forEach(instName => {
      const details = institutionDetails[instName];
      console.log(`📍 "${instName}"`);
      console.log(`   Length: ${details.length} chars`);
      console.log(`   Trimmed: "${details.trimmed}" (${details.trimmedLength} chars)`);
      console.log(`   Has padding: ${details.hasPadding ? '⚠️ YES' : '✅ NO'}`);
      console.log(`   Lowercase: "${details.lowercase}"`);
      console.log(`   Users: ${details.users.length}`);
      details.users.forEach(u => {
        console.log(`      - ${u.name} (${u.email})`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
};

checkInstitutionFormat();
