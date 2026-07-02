import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './courses/courses.module';
import { StudentsModule } from './students/students.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './scholartrack.db',
      entities: [User],
      synchronize: true, // Set to false in production
      logging: false,
    }),
    UsersModule,
    AuthModule,
    CoursesModule,
    StudentsModule,
    AdminModule,
  ],
})
export class AppModule {}
