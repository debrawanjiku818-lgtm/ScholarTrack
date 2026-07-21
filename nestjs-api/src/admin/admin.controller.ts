import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  @Get('stats')
  async getStats() {
    const totalStudents = await this.prisma.user.count({ where: { role: 'STUDENT' } });
    const totalStaff = await this.prisma.user.count({ where: { role: 'STAFF' } });
    const totalEnrollments = await this.prisma.enrollment.count();
    const completedCourses = await this.prisma.enrollment.count({ where: { completedAt: { not: null } } });
    const activeCourses = await this.prisma.course.count({ where: { isActive: true } });
    const completionPercentage = totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0;
    const studentsLoggedIn = await this.prisma.loginLog.groupBy({
      by: ['username'],
      where: { status: 'success', role: 'STUDENT' },
    });
    return {
      totalStudents, totalStaff, totalEnrollments, completedCourses,
      activeCourses, completionPercentage, studentsLoggedIn: studentsLoggedIn.length,
    };
  }

  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  @Get('users')
  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return { users };
  }

  // NEW: Get staff dashboard data
  @Roles('STAFF')
  @Get('staff-dashboard')
  async getStaffDashboard(@Request() req) {
    const staffId = req.user.id;
    const staffUsername = req.user.username;
    
    // Find the subject this staff member teaches
    const subjectMap: Record<string, string> = {
      'math_teacher': 'Mathematics',
      'science_teacher': 'Science',
      'programming_teacher': 'Programming',
      'business_teacher': 'Business',
      'design_teacher': 'Design'
    };
    const subjectName = subjectMap[staffUsername] || '';
    
    // Get the subject
    const subject = await this.prisma.subject.findFirst({
      where: { name: subjectName },
      include: { courses: true },
    });
    
    if (!subject) {
      return {
        subject: null,
        courses: [],
        students: [],
        enrollments: [],
        message: 'No subject assigned to this staff member'
      };
    }
    
    // Get course IDs for this subject
    const courseIds = subject.courses.map((c: any) => c.id);
    
    // Get enrollments for these courses
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: true,
        course: true,
      },
    });
    
    // Get unique students
    const studentIds = [...new Set(enrollments.map((e: any) => e.userId))];
    const students = await this.prisma.user.findMany({
      where: { id: { in: studentIds } },
    });
    
    return {
      subject: subject.name,
      courses: subject.courses,
      students: students,
      enrollments: enrollments,
      totalStudents: students.length,
      totalCourses: subject.courses.length,
    };
  }
}
