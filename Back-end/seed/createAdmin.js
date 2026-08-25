const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const generateCode = require('../utils/generateCode');


const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    const adminData = {
      name: 'Super Admin',
      email: 'abdelrahmanmohamedahmed540@gmail.com',
      password: 'abdo@12345',
      role: 'admin',
      isVerified: true,
      isActive: true,
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  الأدمن موجود بالفعل بنفس الإيميل ده');
      process.exit(0);
    }

    const admin = await User.create({
      ...adminData,
      code: generateCode('ADM'),
    });

    console.log('✅ تم إنشاء حساب الأدمن بنجاح:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Code: ${admin.code}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ حصل خطأ أثناء إنشاء الأدمن:', error.message);
    process.exit(1);
  }
};

createAdmin();