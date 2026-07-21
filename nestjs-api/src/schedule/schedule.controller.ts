import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  async getAllSchedules() {
    return this.scheduleService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('STAFF', 'ADMIN')
  async createSchedule(@Body() body: { course: string; type: string; date: string; time: string; location: string }) {
    return this.scheduleService.create(body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('STAFF', 'ADMIN')
  async deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
