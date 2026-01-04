require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔍 Checking for existing admin users...\n');
    
    // Check if admin users exist
    const existingAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    });

    if (existingAdmins.length > 0) {
      console.log('📋 Found existing admin user(s):\n');
      existingAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Verified: ${admin.isVerified}`);
        console.log('');
      });
      console.log('💡 Use one of the emails above to log in.');
      console.log('💡 If you forgot the password, you can reset it or create a new admin user.\n');
      return;
    }

    console.log('❌ No admin users found.\n');
    console.log('📝 Creating a new admin user...\n');

    // Get credentials from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@borrands.com.ng';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminUniversity = process.env.ADMIN_UNIVERSITY || 'University of Lagos';

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${adminEmail} already exists!`);
      console.log('   Current role:', existingUser.role);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('\n💡 You can update this user to admin role in the database.');
        console.log(`   Run: UPDATE users SET role = 'ADMIN' WHERE email = '${adminEmail}';`);
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        phone: '+2348000000000',
        role: 'ADMIN',
        university: adminUniversity,
        isVerified: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: false,
        whatsappVerified: false,
        addresses: JSON.stringify([]),
        preferences: JSON.stringify({}),
        wallet: JSON.stringify({ balance: 0, transactions: [] }),
        stats: JSON.stringify({})
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  IMPORTANT: Update ADMIN_EMAIL and ADMIN_PASSWORD in .env.local if you want custom credentials.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.error('   User with this email already exists!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

