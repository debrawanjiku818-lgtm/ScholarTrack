import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async getStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });
  }

  async getStaff() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: ['STAFF', 'PRINCIPAL', 'DEPUTY_PRINCIPAL'],
        },
      },
    });
  }
}
