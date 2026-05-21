const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../../.env.development' });

const User = require('../modules/user/user.model');

const adminUser = {
  email: 'admin@bookstore.com',
  username: 'admin',
  password: 'Admin123!@#',
  role: 'admin',
  isVerified: true,
};

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🔐 Role:', existingAdmin.role);
    } else {
      const admin = new User(adminUser);
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Username:', adminUser.username);
      console.log('🔐 Role:', adminUser.role);
      console.log('🔑 Password: Admin123!@#');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

createAdmin();
