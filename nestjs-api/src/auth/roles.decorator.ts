import { SetMetadata } from '@nestjs/common';

type UserRole = 'STUDENT' | 'ADMIN' | 'PRINCIPAL' | 'DEPUTY_PRINCIPAL' | 'STAFF';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
