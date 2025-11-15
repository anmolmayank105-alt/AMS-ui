const mongoose = require('mongoose');
require('dotenv').config();

async function checkDirectly() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}, {
      projection: {
        email: 1,
        firstName: 1,
        lastName: 1
      }
    }).limit(5).toArray();

    console.log('\n📊 Direct MongoDB Query Results:\n');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   firstName: ${JSON.stringify(user.firstName)}`);
      console.log(`   lastName: ${JSON.stringify(user.lastName)}`);
      console.log(`   Has firstName field: ${user.hasOwnProperty('firstName')}`);
      console.log(`   Has lastName field: ${user.hasOwnProperty('lastName')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDirectly();
