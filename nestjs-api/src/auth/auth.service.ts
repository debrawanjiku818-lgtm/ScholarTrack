import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async login(username: string, password: string, ip: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Use the correct field names from your schema
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    
    // Use correct field names for LoginLog
    await this.prisma.loginLog.create({
      data: {
        username: user.username,
        role: user.role,
        status: 'success',
        ipAddress: ip,
        loginTime: new Date(),
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(username: string, password: string, role: string, email?: string, fullName?: string) {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    if (email) {
      const existingEmail = await this.usersService.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use correct field names from your schema
    const user = await this.prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        email: email || null,
        fullName: fullName || null,
        role: role as any,
        isActive: true,
      },
    });

    if (email) {
      const verificationToken = this.jwtService.sign(
        { sub: user.id, email },
        { expiresIn: '24h' }
      );
      
      await this.emailService.sendVerificationEmail(
        email,
        fullName || username,
        verificationToken
      );
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: email 
        ? 'Registration successful! Please check your email for verification.'
        : 'Registration successful!',
    };
  }

  // ========== FORGOT PASSWORD ==========
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If an account exists with this email, you will receive a password reset link.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email },
      { expiresIn: '1h' }
    );

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.fullName || user.username,
      resetToken
    );

    return { message: 'If an account exists with this email, you will receive a password reset link.' };
  }

  // ========== RESET PASSWORD ==========
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      return { message: 'Password reset successfully!' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ========== EMAIL VERIFICATION ==========
  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (user.isVerified) {
        return { message: 'Email already verified' };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      return { message: 'Email verified successfully!' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getLoginHistory(user: any) {
    return this.prisma.loginLog.findMany({
      where: { username: user.username },
      orderBy: { loginTime: 'desc' },
      take: 10,
    });
  }
}
