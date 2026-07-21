import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Users already exist, skipping seed');
    await prisma.$disconnect();
    return;
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('2005', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: adminPassword,
      email: 'admin@scholartrack.com',
      fullName: 'System Administrator',
      role: 'ADMIN',
    },
  });

  // Create student user
  const studentPassword = await bcrypt.hash('1234', 10);
  const student = await prisma.user.create({
    data: {
      username: 'student',
      passwordHash: studentPassword,
      email: 'student@scholartrack.com',
      fullName: 'Test Student',
      role: 'STUDENT',
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('1234', 10);
  const staff = await prisma.user.create({
    data: {
      username: 'staff',
      passwordHash: staffPassword,
      email: 'staff@scholartrack.com',
      fullName: 'Test Staff',
      role: 'STAFF',
    },
  });

  console.log('Seed completed successfully');
  console.log('Created users: admin (password: 2005), student (password: 1234), staff (password: 1234)');

  await prisma.$disconnect();
}

seed().catch(console.error);
