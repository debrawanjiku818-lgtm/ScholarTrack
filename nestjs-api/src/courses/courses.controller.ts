import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @Public()
  async getAllCourses() {
    const courses = await this.coursesService.findAll();
    return { courses };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'STAFF')
  async addCourse(@Body() body: { name: string; description?: string; image_url?: string }) {
    const course = await this.coursesService.create(body);
    return { course, message: 'Course added successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL')
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
