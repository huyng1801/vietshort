import { SetMetadata } from '@nestjs/common';
import { VipType, AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (VipType | AdminRole)[]) => SetMetadata(ROLES_KEY, roles);
