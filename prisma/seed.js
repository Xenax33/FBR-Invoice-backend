import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@fbr.gov.pk' },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@fbr.gov.pk',
      businessName: 'FBR Admin',
      province: 'Punjab',
      address: 'House no 533 Block C Johar Town Lahore',
      ntncnic: '1234567890123',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Seed some sample HS codes
  const hsCodes = [
    { hsCode: '1234.56.78', description: 'Sample HS Code 1' },
    { hsCode: '8765.43.21', description: 'Sample HS Code 2' },
    { hsCode: '5555.55.55', description: 'Sample HS Code 3' },
  ];

  for (const code of hsCodes) {
    await prisma.hsCode.upsert({
      where: { hsCode: code.hsCode },
      update: {},
      create: code,
    });
  }

  console.log('✅ Sample HS codes created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
