import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type UserRole = 'STUDENT' | 'ADMIN' | 'PRINCIPAL' | 'DEPUTY_PRINCIPAL' | 'STAFF';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log("User role:", user?.role, "Required:", requiredRoles);
    return requiredRoles.some((role) => user.role === role);
  }
}
