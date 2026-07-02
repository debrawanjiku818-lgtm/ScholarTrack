import { Controller, Post, Get, Body } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Post('login')
  login(@Body() admin: { username: string; password: string }) {
    if (admin.username === 'Debra' && admin.password === '2005') {
      return { message: 'Login successful', username: admin.username };
    }
    return { error: 'Invalid credentials' };
  }

  @Get('stats')
  getStats() {
    return {
      total_courses: 8,
      total_students: 0,
      total_enrollments: 0,
    };
  }
}
