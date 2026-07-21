import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private toApiShape(course: any) {
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      image_url: course.imageUrl,
      is_active: course.isActive,
      // Include subject information
      subject: course.subject ? {
        id: course.subject.id,
        name: course.subject.name,
      } : null,
      subject_id: course.subjectId,
    };
  }

  async findAll() {
    const courses = await this.prisma.course.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        subject: true, // Include the subject relation
      },
    });
    return courses.map((c) => this.toApiShape(c));
  }

  async create(data: { name: string; description?: string; image_url?: string; subject_id?: number }) {
    const course = await this.prisma.course.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.image_url,
        subjectId: data.subject_id,
      },
      include: {
        subject: true,
      },
    });
    return this.toApiShape(course);
  }

  async remove(id: number) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    await this.prisma.course.delete({ where: { id } });
    return { message: `Course ${course.name} deleted successfully` };
  }
}
