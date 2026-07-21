import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const schedules = await this.prisma.schedule.findMany({
      orderBy: { date: 'asc' },
    });

    return schedules.map((s) => ({
      id: s.id,
      course: s.course,
      type: s.type,
      date: s.date.toISOString().split('T')[0],
      time: s.time,
      location: s.location,
    }));
  }

  async create(data: { course: string; type: string; date: string; time: string; location: string }) {
    const schedule = await this.prisma.schedule.create({
      data: {
        course: data.course,
        type: data.type,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
      },
    });

    return {
      id: schedule.id,
      course: schedule.course,
      type: schedule.type,
      date: schedule.date.toISOString().split('T')[0],
      time: schedule.time,
      location: schedule.location,
    };
  }

  async remove(id: number) {
    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted successfully' };
  }
}
