import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }
    return student;
  }

  async create(username: string, password: string, email?: string, fullName?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        email: email || null,
        fullName: fullName || null,
        role: 'STUDENT',
        isActive: true,
      },
    });
  }

  async enroll(studentId: number, courseId: number) {
    const student = await this.findOne(studentId);
    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} not found`);
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });
    if (existingEnrollment) {
      throw new ConflictException('Student already enrolled in this course');
    }

    return this.prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId,
      },
      include: {
        course: true,
      },
    });
  }

  async getEnrollments(studentId: number) {
    const student = await this.findOne(studentId);
    return this.prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: true,
      },
    });
  }

  async unenroll(studentId: number, courseId: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });
  }
}
