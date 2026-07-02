import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await this.usersService.validatePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }
    
    const { password_hash, ...result } = user;
    return result;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { username: user.username, sub: user.id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      redirect: this.getRedirectPath(user.role),
    };
  }

  async register(username: string, password: string, role: UserRole, email?: string, fullName?: string) {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }
    
    const user = await this.usersService.create(username, password, role, email, fullName);
    
    const { password_hash, ...result } = user;
    return {
      user: result,
      message: 'User registered successfully',
    };
  }

  private getRedirectPath(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.STAFF:
        return '/staff';
      case UserRole.STUDENT:
        return '/dashboard';
      default:
        return '/';
    }
  }
}
