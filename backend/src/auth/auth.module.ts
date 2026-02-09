import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import {
  GoogleOAuthStrategy,
  FacebookOAuthStrategy,
  AppleOAuthStrategy,
  TikTokOAuthService,
} from './oauth.strategy';
import { RateLimiterService } from './rate-limiter.service';
import { SessionService } from './session.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleOAuthStrategy,
    FacebookOAuthStrategy,
    AppleOAuthStrategy,
    TikTokOAuthService,
    RateLimiterService,
    SessionService,
  ],
  exports: [AuthService, SessionService],
})
export class AuthModule {}