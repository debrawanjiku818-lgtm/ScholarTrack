import { Controller, Get, Post, Delete, Patch, Body, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Get()
  async getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getByUser(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async getAllEnrollments() {
    return this.enrollmentsService.getAll();
  }

  @Post()
  async enroll(@Request() req, @Body() body: { course_id: number }) {
    return this.enrollmentsService.enroll(req.user.id, body.course_id);
  }

  @Delete(':courseId')
  async unenroll(@Request() req, @Param('courseId', ParseIntPipe) courseId: number) {
    return this.enrollmentsService.unenroll(req.user.id, courseId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('STAFF', 'ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async updateGrade(@Param('id', ParseIntPipe) id: number, @Body() body: { grade: string }) {
    return this.enrollmentsService.updateGrade(id, body.grade);
  }
}
