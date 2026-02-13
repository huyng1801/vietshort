import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { DatabaseModule, databaseConfig } from './config/database.config';
import { RedisModule } from './config/redis.config';

// Group modules
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';
import { CtvModule } from './ctv/ctv.module';

// Guards and interceptors
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttle.guard';
import { AuditLogInterceptor } from './common/interceptors/logging.interceptor';

// Configuration - load all config modules
import jwtConfig from './config/jwt.config';
import paymentConfig from './config/payment.config';
import cloudflareConfig from './config/cloudflare.config';
import securityConfig from './config/security.config';
import monitoringConfig from './config/monitoring.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, paymentConfig, cloudflareConfig, securityConfig, monitoringConfig, redisConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting - loads from security config
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: (config.get('security.rateLimit.ttl') || 60) * 1000,
        limit: config.get('security.rateLimit.limit') || 100,
      }],
    }),

    // Core modules
    DatabaseModule,
    RedisModule,

    // Feature modules - grouped by responsibility
    AdminModule,      // Admin CMS APIs
    ClientModule,     // Customer/Client APIs
    CtvModule,        // CTV Portal APIs
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}