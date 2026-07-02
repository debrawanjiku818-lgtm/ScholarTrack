import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const result = await this.authService.login(loginDto.username, loginDto.password);
    return result;
  }

  @Post('register')
  async register(@Body() registerDto: { 
    username: string; 
    password: string; 
    role: UserRole; 
    email?: string; 
    fullName?: string 
  }) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
      registerDto.role,
      registerDto.email,
      registerDto.fullName,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnly() {
    return { message: 'Admin access granted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF)
  @Get('staff-only')
  staffOnly() {
    return { message: 'Staff access granted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('student-only')
  studentOnly() {
    return { message: 'Student access granted' };
  }
}
