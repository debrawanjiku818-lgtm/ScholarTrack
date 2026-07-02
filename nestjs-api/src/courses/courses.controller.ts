import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';

@Controller('courses')
export class CoursesController {
  private courses = [
    { name: 'Mathematics', description: 'Algebra, geometry, calculus.', image: '/maths.jpg' },
    { name: 'Computer Science', description: 'Programming, databases, web dev.', image: '/cs.jpg' },
    { name: 'Biology', description: 'Life sciences and experiments.', image: '/biology.jpg' },
    { name: 'History', description: 'World history and culture.', image: '/history.jpg' },
    { name: 'Physics', description: 'Mechanics, thermodynamics, waves.', image: '/physics.jpg' },
    { name: 'Chemistry', description: 'Organic, inorganic, physical chemistry.', image: '/chemistry.jpg' },
    { name: 'Geography', description: 'Physical and human geography.', image: '/geography.jpg' },
    { name: 'Literature', description: 'Poetry, novels, drama analysis.', image: '/literature.jpg' },
  ];

  @Get()
  getAllCourses() {
    return this.courses;
  }

  @Post()
  addCourse(@Body() course: any) {
    this.courses.push(course);
    return { message: 'Course added successfully', course };
  }

  @Delete(':courseName')
  deleteCourse(@Param('courseName') courseName: string) {
    this.courses = this.courses.filter(c => c.name !== courseName);
    return { message: `Course ${courseName} deleted successfully` };
  }
}
