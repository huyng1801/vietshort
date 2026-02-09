import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VipType, AdminRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(VipType | AdminRole)[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userRole = user.vipTier || user.role;
    return requiredRoles.some((role) => {
      if (role === userRole) return true;
      if (role === VipType.VIP_FREEADS && user.vipTier === VipType.VIP_GOLD) return true;
      if (user.role) {
        const hierarchy: Record<string, number> = {
          [AdminRole.SUPER_ADMIN]: 4,
          [AdminRole.ADMIN]: 3,
          [AdminRole.MODERATOR]: 2,
          [AdminRole.CONTENT_MANAGER]: 1,
        };
        const requiredLevel = hierarchy[role as string];
        const userLevel = hierarchy[user.role as string];
        return requiredLevel && userLevel && userLevel >= requiredLevel;
      }
      return false;
    });
  }
}
