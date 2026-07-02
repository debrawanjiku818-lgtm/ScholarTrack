import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';

@Controller('students')
export class StudentsController {
  private students: any = {};

  @Get(':studentName')
  getStudent(@Param('studentName') studentName: string) {
    if (studentName in this.students) {
      return this.students[studentName];
    }
    return { error: 'Student not found' };
  }

  @Post(':studentName/enroll')
  enrollCourse(@Param('studentName') studentName: string, @Body() body: { courseName: string }) {
    if (!(studentName in this.students)) {
      this.students[studentName] = { name: studentName, enrolled_courses: [] };
    }
    
    if (!this.students[studentName].enrolled_courses.includes(body.courseName)) {
      this.students[studentName].enrolled_courses.push(body.courseName);
      return { message: `Successfully enrolled in ${body.courseName}` };
    }
    return { message: 'Already enrolled in this course' };
  }

  @Delete(':studentName/enroll/:courseName')
  unenrollCourse(@Param('studentName') studentName: string, @Param('courseName') courseName: string) {
    if (studentName in this.students) {
      if (this.students[studentName].enrolled_courses.includes(courseName)) {
        this.students[studentName].enrolled_courses = this.students[studentName].enrolled_courses.filter((c: string) => c !== courseName);
        return { message: `Successfully unenrolled from ${courseName}` };
      }
    }
    return { error: 'Student or course not found' };
  }
}
