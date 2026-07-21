import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggingMiddleware } from './logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from './courses/courses.module';
import { StudentsModule } from './students/students.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ScheduleModule } from './schedule/schedule.module';
import { MessagesModule } from './messages/messages.module';
import { EmailModule } from './email/email.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    StudentsModule,
    AdminModule,
    EnrollmentsModule,
    ScheduleModule,
    MessagesModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
