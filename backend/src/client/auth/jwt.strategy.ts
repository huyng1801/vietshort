import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: { sub: string; email: string; isAdmin?: boolean; role?: string }) {
    // Admin tokens have isAdmin: true flag set during admin login
    if (payload.isAdmin) {
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
      if (!admin || !admin.isActive) return null;
      return { id: admin.id, email: admin.email, role: admin.role, isAdmin: true, permissions: admin.permissions };
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) return null;
    return user;
  }
}
