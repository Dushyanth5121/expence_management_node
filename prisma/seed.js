const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      email: 'admin@example.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true
    },
    {
      email: 'user@example.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_active: true
    },
    {
      email: 'moderator@example.com',
      password_hash: hashedPassword,
      first_name: 'Moderator',
      last_name: 'User',
      role: 'moderator',
      is_active: true
    }
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    console.log(`✅ Created/Updated user: ${user.email} (${user.role})`);
  }

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });