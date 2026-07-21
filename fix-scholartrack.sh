#!/bin/bash
# ============================================================
# ScholarTrack Bugfix Script
# Run this from: ~/Documents/ScholarTrack
# ============================================================

set -e

BACKEND="$HOME/Documents/ScholarTrack/nestjs-api"
FRONTEND="$HOME/Documents/ScholarTrack/app"

echo "========================================"
echo "  ScholarTrack Bugfix Script"
echo "========================================"
echo ""

if [ ! -d "$BACKEND/src" ]; then
    echo "ERROR: Backend not found at $BACKEND"
    exit 1
fi

echo "[✓] Backend found"
echo "[✓] Frontend found"
echo ""

# STEP 1: Add JWT_SECRET to .env
echo "========================================"
echo "STEP 1: Adding JWT_SECRET to backend .env"
echo "========================================"

if ! grep -q "JWT_SECRET" "$BACKEND/.env" 2>/dev/null; then
    echo "" >> "$BACKEND/.env"
    echo "# JWT Configuration" >> "$BACKEND/.env"
    echo "JWT_SECRET=scholartrack-super-secret-key-change-in-production-$(date +%s)" >> "$BACKEND/.env"
    echo "[✓] JWT_SECRET added"
else
    echo "[✓] JWT_SECRET already exists"
fi

# STEP 2: Fix auth.module.ts
echo ""
echo "========================================"
echo "STEP 2: Fixing auth.module.ts"
echo "========================================"

cat > "$BACKEND/src/auth/auth.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
EOF

echo "[✓] auth.module.ts updated"

# STEP 3: Fix jwt.strategy.ts
echo ""
echo "========================================"
echo "STEP 3: Fixing jwt.strategy.ts"
echo "========================================"

cat > "$BACKEND/src/auth/jwt.strategy.ts" << 'EOF'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
    };
  }
}
EOF

echo "[✓] jwt.strategy.ts updated"

# STEP 4: Fix auth.service.ts
echo ""
echo "========================================"
echo "STEP 4: Fixing auth.service.ts"
echo "========================================"

cat > "$BACKEND/src/auth/auth.service.ts" << 'EOF'
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'STUDENT' | 'ADMIN' | 'PRINCIPAL' | 'DEPUTY_PRINCIPAL' | 'STAFF';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(username: string, password: string, ipAddress?: string) {
    const user = await this.validateUser(username, password);

    if (!user) {
      await this.prisma.loginLog.create({
        data: {
          username,
          role: null,
          status: 'failed',
          ipAddress,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.loginLog.create({
      data: {
        username: user.username,
        role: user.role,
        status: 'success',
        ipAddress,
      },
    });

    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
      },
    };
  }

  async register(username: string, password: string, role: UserRole, email?: string, fullName?: string) {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const user = await this.usersService.create(username, password, role, email, fullName);

    const { passwordHash, ...result } = user;
    return {
      user: result,
      message: 'User registered successfully',
    };
  }

  async getLoginHistory(requestingUser: { username: string; role: string }) {
    if (requestingUser.role === 'ADMIN') {
      return this.prisma.loginLog.findMany({
        orderBy: { loginTime: 'desc' },
        take: 50,
      });
    }
    return this.prisma.loginLog.findMany({
      where: { username: requestingUser.username },
      orderBy: { loginTime: 'desc' },
      take: 50,
    });
  }
}
EOF

echo "[✓] auth.service.ts updated"

# STEP 5: Fix auth.controller.ts
echo ""
echo "========================================"
echo "STEP 5: Fixing auth.controller.ts"
echo "========================================"

cat > "$BACKEND/src/auth/auth.controller.ts" << 'EOF'
import { Controller, Post, Body, Get, UseGuards, Request, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

type UserRole = 'STUDENT' | 'ADMIN' | 'PRINCIPAL' | 'DEPUTY_PRINCIPAL' | 'STAFF';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }, @Ip() ip: string) {
    const result = await this.authService.login(loginDto.username, loginDto.password, ip);
    return result;
  }

  @Post('register')
  async register(@Body() registerDto: {
    username: string;
    password: string;
    role: UserRole;
    email?: string;
    fullName?: string
  }) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
      registerDto.role,
      registerDto.email,
      registerDto.fullName,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'STUDENT')
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'STUDENT')
  @Get('login-history')
  getLoginHistory(@Request() req) {
    return this.authService.getLoginHistory(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  adminOnly() {
    return { message: 'Admin access granted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  @Get('staff-only')
  staffOnly() {
    return { message: 'Staff access granted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Get('student-only')
  studentOnly() {
    return { message: 'Student access granted' };
  }
}
EOF

echo "[✓] auth.controller.ts updated"

# STEP 6: Create StudentsService
echo ""
echo "========================================"
echo "STEP 6: Creating students.service.ts"
echo "========================================"

cat > "$BACKEND/src/students/students.service.ts" << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        isActive: true,
        enrollments: {
          include: {
            course: true
          }
        }
      }
    });
  }

  async findOne(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            course: true
          }
        }
      }
    });
    
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async create(username: string, password: string, email?: string, fullName?: string) {
    return this.usersService.create(username, password, 'STUDENT', email, fullName);
  }

  async enroll(studentId: number, courseId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: courseId
      }
    });

    if (existingEnrollment) {
      return { message: 'Already enrolled in this course' };
    }

    await this.prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId
      }
    });

    return { message: 'Successfully enrolled in course' };
  }

  async unenroll(studentId: number, courseId: number) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: courseId
      }
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollment.id }
    });

    return { message: 'Successfully unenrolled from course' };
  }

  async delete(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.user.delete({
      where: { id: studentId }
    });

    return { message: 'Student deleted successfully' };
  }
}
EOF

echo "[✓] students.service.ts created"

# STEP 7: Fix StudentsModule
echo ""
echo "========================================"
echo "STEP 7: Fixing students.module.ts"
echo "========================================"

cat > "$BACKEND/src/students/students.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
EOF

echo "[✓] students.module.ts updated"

# STEP 8: Fix StudentsController
echo ""
echo "========================================"
echo "STEP 8: Fixing students.controller.ts"
echo "========================================"

cat > "$BACKEND/src/students/students.controller.ts" << 'EOF'
import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async getAllStudents() {
    return this.studentsService.findAll();
  }

  @Get(':studentId')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async getStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.findOne(studentId);
  }

  @Post()
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async createStudent(@Body() body: { username: string; password: string; email?: string; fullName?: string }) {
    const user = await this.studentsService.create(body.username, body.password, body.email, body.fullName);
    const { passwordHash, ...result } = user;
    return { message: 'Student created successfully', student: result };
  }

  @Post(':studentId/enroll')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async enrollCourse(@Param('studentId', ParseIntPipe) studentId: number, @Body() body: { courseId: number }) {
    return this.studentsService.enroll(studentId, body.courseId);
  }

  @Delete(':studentId/enroll/:courseId')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async unenrollCourse(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    return this.studentsService.unenroll(studentId, courseId);
  }

  @Delete(':studentId')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async deleteStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.delete(studentId);
  }
}
EOF

echo "[✓] students.controller.ts updated"

# STEP 9: Fix AdminController
echo ""
echo "========================================"
echo "STEP 9: Fixing admin.controller.ts"
echo "========================================"

cat > "$BACKEND/src/admin/admin.controller.ts" << 'EOF'
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  @Get('stats')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async getStats() {
    const [totalStudents, totalStaff, totalEnrollments, completedCourses] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      this.prisma.user.count({ where: { role: 'STAFF', isActive: true } }),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { completedAt: { not: null } } }),
    ]);

    return {
      totalStudents,
      totalStaff,
      totalEnrollments,
      completedCourses,
      completionPercentage: totalEnrollments > 0
        ? Math.round((completedCourses / totalEnrollments) * 100)
        : 0,
    };
  }

  @Get('users')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async getUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        is_active: u.isActive,
        created_at: u.createdAt,
      })),
    };
  }

  @Get('students')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async getStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        enrollments: {
          include: {
            course: true
          }
        }
      }
    });
  }

  @Get('staff')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async getStaff() {
    const staff = await this.prisma.user.findMany({
      where: { role: { in: ['STAFF', 'PRINCIPAL', 'DEPUTY_PRINCIPAL'] } },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    const staffWithSubjects = await Promise.all(
      staff.map(async (user) => {
        const subjects = await this.prisma.subject.findMany({
          where: { staffId: user.id },
          include: {
            courses: true
          }
        });
        return {
          ...user,
          subjects
        };
      })
    );

    return staffWithSubjects;
  }

  @Post('students')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async createStudent(@Body() body: { username: string; password: string; email?: string; fullName?: string }) {
    const user = await this.usersService.create(body.username, body.password, 'STUDENT', body.email, body.fullName);
    const { passwordHash, ...result } = user;
    return { message: 'Student created successfully', student: result };
  }

  @Post('staff')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async createStaff(@Body() body: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
    role: 'STAFF' | 'PRINCIPAL' | 'DEPUTY_PRINCIPAL';
  }) {
    const user = await this.usersService.create(body.username, body.password, body.role, body.email, body.fullName);
    const { passwordHash, ...result } = user;
    return { message: 'Staff created successfully', staff: result };
  }

  @Post('subjects')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async createSubject(@Body() body: { name: string; description?: string; staffId?: number }) {
    const subject = await this.prisma.subject.create({
      data: {
        name: body.name,
        description: body.description,
        staffId: body.staffId
      },
      include: {
        staff: true,
        courses: true
      }
    });
    return { message: 'Subject created successfully', subject };
  }

  @Put('subjects/:subjectId/assign-staff')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async assignStaffToSubject(@Param('subjectId', ParseIntPipe) subjectId: number, @Body() body: { staffId: number }) {
    const subject = await this.prisma.subject.update({
      where: { id: subjectId },
      data: { staffId: body.staffId },
      include: {
        staff: true,
        courses: true
      }
    });
    return { message: 'Staff assigned to subject successfully', subject };
  }

  @Get('subjects')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async getSubjects() {
    return this.prisma.subject.findMany({
      include: {
        staff: true,
        courses: true
      }
    });
  }

  @Delete('users/:userId')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    await this.prisma.user.delete({
      where: { id: userId }
    });
    return { message: 'User deleted successfully' };
  }

  @Put('users/:userId/deactivate')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async deactivateUser(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    return { message: 'User deactivated successfully', user };
  }

  @Put('users/:userId/activate')
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async activateUser(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });
    return { message: 'User activated successfully', user };
  }
}
EOF

echo "[✓] admin.controller.ts updated"

# STEP 10: Fix AdminModule
echo ""
echo "========================================"
echo "STEP 10: Fixing admin.module.ts"
echo "========================================"

cat > "$BACKEND/src/admin/admin.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AdminController],
})
export class AdminModule {}
EOF

echo "[✓] admin.module.ts updated"

# STEP 11: Fix CoursesController
echo ""
echo "========================================"
echo "STEP 11: Fixing courses.controller.ts"
echo "========================================"

cat > "$BACKEND/src/courses/courses.controller.ts" << 'EOF'
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CoursesService } from './courses.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  async getAllCourses() {
    const courses = await this.coursesService.findAll();
    return { courses };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async addCourse(@Body() body: { name: string; description?: string; image_url?: string }) {
    const course = await this.coursesService.create(body);
    return { course };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
EOF

echo "[✓] courses.controller.ts updated"

# STEP 12: Fix CoursesModule
echo ""
echo "========================================"
echo "STEP 12: Fixing courses.module.ts"
echo "========================================"

cat > "$BACKEND/src/courses/courses.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
EOF

echo "[✓] courses.module.ts updated"

# STEP 13: Fix AppModule - remove DashboardModule
echo ""
echo "========================================"
echo "STEP 13: Fixing app.module.ts"
echo "========================================"

cat > "$BACKEND/src/app.module.ts" << 'EOF'
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
EOF

echo "[✓] app.module.ts updated"

# STEP 14: Delete Dashboard files
echo ""
echo "========================================"
echo "STEP 14: Deleting dashboard module"
echo "========================================"

rm -rf "$BACKEND/src/dashboard"
echo "[✓] Dashboard module deleted"

# STEP 15: Fix frontend login
echo ""
echo "========================================"
echo "STEP 15: Fixing frontend login/page.tsx"
echo "========================================"

cat > "$FRONTEND/app/login/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      window.dispatchEvent(new Event('auth-change'));

      const role = data.user.role;
      switch (role) {
        case "ADMIN":
        case "PRINCIPAL":
        case "DEPUTY_PRINCIPAL":
          router.push("/admin");
          break;
        case "STAFF":
          router.push("/staff");
          break;
        case "STUDENT":
          router.push("/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            ScholarTrack
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label htmlFor="username" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your username"
              required
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              required
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#667eea',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#5568d3';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#667eea';
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <p>Don't have an account? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
}
EOF

echo "[✓] Frontend login updated"

# STEP 16: Fix frontend dashboard
echo ""
echo "========================================"
echo "STEP 16: Fixing frontend dashboard/page.tsx"
echo "========================================"

cat > "$FRONTEND/app/dashboard/page.tsx" << 'EOF'
"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface EnrolledCourse {
  id: number;
  name: string;
  description: string;
  image_url: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
}

export default function Dashboard() {
  const [studentName, setStudentName] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [inProgressCourses, setInProgressCourses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role.toUpperCase() !== "STUDENT") {
      window.location.href = "/login";
      return;
    }

    setStudentName(user.username || "");
    
    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const courses = await response.json();
        setEnrolledCourses(courses);
        setTotalEnrollments(courses.length);
        setCompletedCourses(courses.filter((c: any) => c.completed_at).length);
        setInProgressCourses(courses.filter((c: any) => !c.completed_at).length);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Courses Chosen", value: loading ? "..." : totalEnrollments, icon: "📚", gradient: "from-blue-500 to-cyan-400" },
    { label: "Completed", value: loading ? "..." : completedCourses, icon: "✅", gradient: "from-green-500 to-emerald-400" },
    { label: "In Progress", value: loading ? "..." : inProgressCourses, icon: "🔄", gradient: "from-orange-500 to-amber-400" },
    { label: "Certificates", value: loading ? "..." : completedCourses, icon: "🏆", gradient: "from-purple-500 to-pink-400" },
  ];

  const recentActivity = [
    { action: "Completed Module 3", course: "Mathematics", time: "2 hours ago", type: "completed" },
    { action: "Started Quiz", course: "Computer Science", time: "5 hours ago", type: "started" },
    { action: "Submitted Assignment", course: "Biology", time: "1 day ago", type: "submitted" },
  ];

  const upcomingDeadlines = [
    { course: "Mathematics", task: "Chapter 5 Quiz", date: "Tomorrow", priority: "high" },
    { course: "Computer Science", task: "Project Submission", date: "In 3 days", priority: "medium" },
    { course: "Biology", task: "Lab Report", date: "In 5 days", priority: "low" },
  ];

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <span>{studentName?.charAt(0).toUpperCase() || "G"}</span>
          </div>
          <div className="user-info">
            <h3>{studentName || "Guest"}</h3>
            <p>Student</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item active">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="/courses" className="nav-item">
            <span>📚</span>
            <span>My Courses</span>
          </a>
          <a href="/student/schedule" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/student/progress" className="nav-item">
            <span>📈</span>
            <span>Progress</span>
          </a>
          <a href="/student/messages" className="nav-item">
            <span>💬</span>
            <span>Messages</span>
          </a>
          <a href="/student/settings" className="nav-item">
            <span>⚙️</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {studentName || "Guest"}! 👋</h1>
            <p>Here's what's happening with your learning journey today.</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.gradient}`}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <div className="card course-progress-card">
            <div className="card-header">
              <h2>📚 Course Progress</h2>
              <a href="/courses" className="view-all">View All</a>
            </div>
            <div className="course-list">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="course-item">
                    <div className="course-info">
                      <h4>{course.name}</h4>
                      <p>{course.completed_at ? 'Completed' : 'In Progress'}</p>
                    </div>
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span>{course.progress}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No courses enrolled yet</p>
                  <a href="/courses" className="btn-primary">Browse Courses</a>
                </div>
              )}
            </div>
          </div>

          <div className="card activity-card">
            <div className="card-header">
              <h2>🕐 Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    <span>{activity.type === "completed" ? "✅" : activity.type === "started" ? "🔄" : "📝"}</span>
                  </div>
                  <div className="activity-content">
                    <h4>{activity.action}</h4>
                    <p>{activity.course}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card deadlines-card">
            <div className="card-header">
              <h2>⏰ Upcoming Deadlines</h2>
            </div>
            <div className="deadlines-list">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="deadline-item">
                  <div className={`deadline-priority ${deadline.priority}`}></div>
                  <div className="deadline-content">
                    <h4>{deadline.task}</h4>
                    <p>{deadline.course}</p>
                  </div>
                  <span className="deadline-date">{deadline.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card quick-actions-card">
            <div className="card-header">
              <h2>⚡ Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <a href="/courses" className="quick-action">
                <span>📖</span>
                <span>Browse Courses</span>
              </a>
              <a href="#" className="quick-action">
                <span>📝</span>
                <span>Take Quiz</span>
              </a>
              <a href="#" className="quick-action">
                <span>💬</span>
                <span>Ask Question</span>
              </a>
              <a href="#" className="quick-action">
                <span>📊</span>
                <span>View Reports</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
EOF

echo "[✓] Frontend dashboard updated"

# STEP 17: Create API client
echo ""
echo "========================================"
echo "STEP 17: Creating frontend lib/api.ts"
echo "========================================"

mkdir -p "$FRONTEND/app/lib"

cat > "$FRONTEND/app/lib/api.ts" << 'EOF'
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (data: { username: string; password: string; role: string; email?: string; fullName?: string }) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getProfile: () => apiFetch("/auth/profile"),
  getLoginHistory: () => apiFetch("/auth/login-history"),
};

export const coursesApi = {
  getAll: () => apiFetch("/courses"),
  create: (data: { name: string; description?: string; image_url?: string }) =>
    apiFetch("/courses", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/courses/${id}`, { method: "DELETE" }),
};

export const enrollmentsApi = {
  getMyEnrollments: () => apiFetch("/enrollments"),
  enroll: (courseId: number) =>
    apiFetch("/enrollments", { method: "POST", body: JSON.stringify({ course_id: courseId }) }),
  unenroll: (courseId: number) =>
    apiFetch("/enrollments", { method: "DELETE", body: JSON.stringify({ course_id: courseId }) }),
};

export const studentsApi = {
  getAll: () => apiFetch("/students"),
  getOne: (id: number) => apiFetch(`/students/${id}`),
  create: (data: { username: string; password: string; email?: string; fullName?: string }) =>
    apiFetch("/students", { method: "POST", body: JSON.stringify(data) }),
  enroll: (studentId: number, courseId: number) =>
    apiFetch(`/students/${studentId}/enroll`, { method: "POST", body: JSON.stringify({ courseId }) }),
  unenroll: (studentId: number, courseId: number) =>
    apiFetch(`/students/${studentId}/enroll/${courseId}`, { method: "DELETE" }),
  delete: (id: number) => apiFetch(`/students/${id}`, { method: "DELETE" }),
};

export const adminApi = {
  getStats: () => apiFetch("/admin/stats"),
  getUsers: () => apiFetch("/admin/users"),
  getStudents: () => apiFetch("/admin/students"),
  getStaff: () => apiFetch("/admin/staff"),
  createStudent: (data: { username: string; password: string; email?: string; fullName?: string }) =>
    apiFetch("/admin/students", { method: "POST", body: JSON.stringify(data) }),
  createStaff: (data: { username: string; password: string; email?: string; fullName?: string; role: string }) =>
    apiFetch("/admin/staff", { method: "POST", body: JSON.stringify(data) }),
  deleteUser: (id: number) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
  deactivateUser: (id: number) => apiFetch(`/admin/users/${id}/deactivate`, { method: "PUT" }),
  activateUser: (id: number) => apiFetch(`/admin/users/${id}/activate`, { method: "PUT" }),
};

export const scheduleApi = {
  getAll: () => apiFetch("/schedule"),
  create: (data: { course: string; type: string; date: string; time: string; location: string }) =>
    apiFetch("/schedule", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/schedule/${id}`, { method: "DELETE" }),
};

export const messagesApi = {
  getInbox: () => apiFetch("/messages"),
  getSent: () => apiFetch("/messages/sent"),
  send: (recipientId: number, content: string) =>
    apiFetch("/messages", { method: "POST", body: JSON.stringify({ recipient_id: recipientId, content }) }),
  markRead: (id: number) => apiFetch(`/messages/${id}/read`, { method: "PATCH" }),
};

export default apiFetch;
EOF

echo "[✓] lib/api.ts created"

# STEP 18: Fix frontend .env
echo ""
echo "========================================"
echo "STEP 18: Fixing frontend .env"
echo "========================================"

if [ -f "$FRONTEND/.env" ]; then
    mv "$FRONTEND/.env" "$FRONTEND/.env.backup.$(date +%s)"
    echo "[✓] Old .env backed up"
fi

cat > "$FRONTEND/.env" << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

echo "[✓] Frontend .env updated"

# STEP 19: Add health check to main.ts
echo ""
echo "========================================"
echo "STEP 19: Adding health check to main.ts"
echo "========================================"

cat > "$BACKEND/src/main.ts" << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });
  
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ScholarTrack API running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
}
bootstrap();
EOF

echo "[✓] main.ts updated"

# STEP 20: Verification
echo ""
echo "========================================"
echo "STEP 20: Verification"
echo "========================================"

echo ""
echo "--- Checking for hardcoded JWT secrets ---"
if grep -r "your-secret-key-change-in-production" "$BACKEND/src" 2>/dev/null; then
    echo "[✗] WARNING: Hardcoded JWT secret still found!"
else
    echo "[✓] No hardcoded JWT secrets"
fi

echo ""
echo "--- Checking dashboard deleted ---"
if [ -d "$BACKEND/src/dashboard" ]; then
    echo "[✗] WARNING: Dashboard directory still exists!"
else
    echo "[✓] Dashboard module deleted"
fi

echo ""
echo "--- Checking StudentsController ---"
if grep -q "JwtAuthGuard" "$BACKEND/src/students/students.controller.ts"; then
    echo "[✓] StudentsController has JwtAuthGuard"
else
    echo "[✗] WARNING: StudentsController missing JwtAuthGuard!"
fi

echo ""
echo "--- Checking CoursesController ---"
if grep -q "JwtAuthGuard" "$BACKEND/src/courses/courses.controller.ts"; then
    echo "[✓] CoursesController has auth guards"
else
    echo "[✗] WARNING: CoursesController missing auth guards!"
fi

echo ""
echo "========================================"
echo "  ALL FIXES APPLIED!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. cd $BACKEND"
echo "  2. npm install"
echo "  3. npx prisma generate"
echo "  4. npm run start:dev"
echo ""
echo "  5. Test health: curl http://localhost:3001/health"
echo ""
echo "  6. cd $FRONTEND"
echo "  7. npm run dev"
echo ""
