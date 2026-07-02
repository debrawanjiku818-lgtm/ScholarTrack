import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: './scholartrack.db',
    entities: [User],
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Users already exist, skipping seed');
    await dataSource.destroy();
    return;
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('2005', 10);
  const admin = userRepository.create({
    username: 'admin',
    password_hash: adminPassword,
    email: 'admin@scholartrack.com',
    full_name: 'System Administrator',
    role: 'admin',
  });
  await userRepository.save(admin);

  // Create student user
  const studentPassword = await bcrypt.hash('1234', 10);
  const student = userRepository.create({
    username: 'student',
    password_hash: studentPassword,
    email: 'student@scholartrack.com',
    full_name: 'Test Student',
    role: 'student',
  });
  await userRepository.save(student);

  // Create staff user
  const staffPassword = await bcrypt.hash('1234', 10);
  const staff = userRepository.create({
    username: 'staff',
    password_hash: staffPassword,
    email: 'staff@scholartrack.com',
    full_name: 'Test Staff',
    role: 'staff',
  });
  await userRepository.save(staff);

  console.log('Seed completed successfully');
  console.log('Created users: admin (password: 2005), student (password: 1234), staff (password: 1234)');

  await dataSource.destroy();
}

seed().catch(console.error);
