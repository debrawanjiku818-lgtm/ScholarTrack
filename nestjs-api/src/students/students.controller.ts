import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async getAllStudents() {
    return this.studentsService.findAll();
  }

  @Get(':studentId')
  async getStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.findOne(studentId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async createStudent(
    @Body() body: { username: string; password: string; email?: string; fullName?: string },
  ) {
    return this.studentsService.create(
      body.username,
      body.password,
      body.email,
      body.fullName,
    );
  }

  @Post(':studentId/enroll')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async enrollStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: { courseId: number },
  ) {
    return this.studentsService.enroll(studentId, body.courseId);
  }

  @Delete(':studentId/enroll/:courseId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async unenrollStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.studentsService.unenroll(studentId, courseId);
  }
}
