import { Controller, Post, Body, Get, UseGuards, Request, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Public } from './public.decorator';

type UserRole = 'STUDENT' | 'ADMIN' | 'PRINCIPAL' | 'DEPUTY_PRINCIPAL' | 'STAFF';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() loginDto: { username: string; password: string }, @Ip() ip: string) {
    const result = await this.authService.login(loginDto.username, loginDto.password, ip);
    return result;
  }

  @Post('register')
  @Public()
  async register(@Body() registerDto: {
    username: string;
    password: string;
    role: UserRole;
    email?: string;
    fullName?: string;
  }) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
      registerDto.role,
      registerDto.email,
      registerDto.fullName,
    );
  }

  // ========== PASSWORD RESET ==========
  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  // ========== EMAIL VERIFICATION ==========
  @Post('verify-email')
  @Public()
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  // ========== PROTECTED ROUTES ==========
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'STUDENT')
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'STUDENT')
  @Get('login-history')
  getLoginHistory(@Request() req) {
    return this.authService.getLoginHistory(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  adminOnly() {
    return { message: 'Admin access granted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  @Get('staff-only')
  staffOnly() {
    return { message: 'Staff access granted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Get('student-only')
  studentOnly() {
    return { message: 'Student access granted' };
  }
}
