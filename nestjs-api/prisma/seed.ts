import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Principal
  const principalPassword = await bcrypt.hash('principal123', 10);
  const principal = await prisma.user.upsert({
    where: { username: 'principal' },
    update: {},
    create: {
      username: 'principal',
      passwordHash: principalPassword,
      email: 'principal@scholartrack.com',
      fullName: 'School Principal',
      role: 'PRINCIPAL',
      isActive: true,
    },
  });
  console.log('Created principal:', principal.username);

  // Create Deputy Principal
  const deputyPassword = await bcrypt.hash('deputy123', 10);
  const deputy = await prisma.user.upsert({
    where: { username: 'deputy' },
    update: {},
    create: {
      username: 'deputy',
      passwordHash: deputyPassword,
      email: 'deputy@scholartrack.com',
      fullName: 'Deputy Principal',
      role: 'DEPUTY_PRINCIPAL',
      isActive: true,
    },
  });
  console.log('Created deputy principal:', deputy.username);

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      email: 'admin@scholartrack.com',
      fullName: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Created admin:', admin.username);

  // Create sample students
  const studentPasswords = await bcrypt.hash('student123', 10);
  const students = [
    { username: 'alice', fullName: 'Alice Johnson' },
    { username: 'james', fullName: 'James Smith' },
    { username: 'brian', fullName: 'Brian Williams' },
    { username: 'ann', fullName: 'Ann Davis' },
    { username: 'mary', fullName: 'Mary Brown' },
    { username: 'peter', fullName: 'Peter Miller' },
    { username: 'john', fullName: 'John Wilson' },
    { username: 'lucy', fullName: 'Lucy Anderson' },
    { username: 'kelvin', fullName: 'Kelvin Taylor' },
  ];

  for (const student of students) {
    await prisma.user.upsert({
      where: { username: student.username },
      update: {},
      create: {
        username: student.username,
        passwordHash: studentPasswords,
        email: `${student.username}@scholartrack.com`,
        fullName: student.fullName,
        role: 'STUDENT',
        isActive: true,
      },
    });
    console.log('Created student:', student.username);
  }

  // Create sample staff
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staffMembers = [
    { username: 'math_teacher', fullName: 'Mathematics Teacher', subject: 'Mathematics' },
    { username: 'science_teacher', fullName: 'Science Teacher', subject: 'Science' },
    { username: 'english_teacher', fullName: 'English Teacher', subject: 'English' },
    { username: 'history_teacher', fullName: 'History Teacher', subject: 'History' },
  ];

  for (const staff of staffMembers) {
    const user = await prisma.user.upsert({
      where: { username: staff.username },
      update: {},
      create: {
        username: staff.username,
        passwordHash: staffPassword,
        email: `${staff.username}@scholartrack.com`,
        fullName: staff.fullName,
        role: 'STAFF',
        isActive: true,
      },
    });
    console.log('Created staff:', staff.username);

    // Create subject for staff
    await prisma.subject.upsert({
      where: { name: staff.subject },
      update: { staffId: user.id },
      create: {
        name: staff.subject,
        description: `${staff.subject} department`,
        staffId: user.id,
      },
    });
    console.log('Created subject:', staff.subject);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
