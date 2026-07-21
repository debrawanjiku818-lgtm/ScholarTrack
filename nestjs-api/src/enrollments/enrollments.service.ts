import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async enroll(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: userId,
        courseId: courseId,
      },
      include: {
        user: true,
        course: true,
      },
    });

    if (enrollment.user.email) {
      await this.emailService.sendEnrollmentConfirmation(
        enrollment.user.email,
        enrollment.user.fullName || enrollment.user.username,
        enrollment.course.name
      );
    }

    return enrollment;
  }

  async getByUser(userId: number) {
    return this.prisma.enrollment.findMany({
      where: { userId: userId },
      include: {
        course: true,
      },
    });
  }

  async getAll() {
    return this.prisma.enrollment.findMany({
      include: {
        user: true,
        course: true,
      },
    });
  }

  async unenroll(userId: number, courseId: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    return { message: 'Successfully unenrolled from course' };
  }

  async updateGrade(id: number, grade: string) {
    return this.prisma.enrollment.update({
      where: { id },
      data: { grade },
    });
  }

  async findAllByCourse(courseId: number) {
    return this.prisma.enrollment.findMany({
      where: { courseId: courseId },
      include: {
        user: true,
      },
    });
  }
}
