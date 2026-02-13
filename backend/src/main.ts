import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const isProduction = configService.get('app.nodeEnv') === 'production';

  // ─── Sentry Initialization ──────────────────────────
  const sentryDsn = configService.get('app.sentry.dsn');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: configService.get('app.sentry.environment') || (isProduction ? 'production' : 'development'),
      tracesSampleRate: configService.get('app.sentry.tracesSampleRate') || 0.1,
      release: `vietshort-api@${process.env.npm_package_version || '1.0.0'}`,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
      ],
      beforeSend(event) {
        // Scrub sensitive data before sending to Sentry
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
    logger.log('Sentry initialized');
  }

  // ─── Security Middleware ────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    noSniff: true,
  }));

  // ─── CORS ──────────────────────────────────────────
  const corsOrigins = configService.get('security.cors.origin') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept-Language'],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24h preflight cache
  });

  // ─── Global Validation Pipe ────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    stopAtFirstError: false,
    validationError: { target: false, value: false }, // Don't leak input in errors
  }));

  // ─── Request Body Limits ───────────────────────────
  const expressApp = app.getHttpAdapter().getInstance();
  const bodyParser = require('express');
  expressApp.use(bodyParser.json({ limit: '10mb' }));
  expressApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // ─── API Prefix ────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Swagger Documentation (non-production only) ───
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('VietShort API')
      .setDescription('VietShort streaming platform API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'JWT',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('videos', 'Video streaming')
      .addTag('admin', 'Admin operations')
      .addTag('ctv', 'CTV affiliate system')
      .addTag('payment', 'Payment processing')
      .addTag('comments', 'Comments & interactions')
      .addTag('gamification', 'Gamification system')
      .addTag('notifications', 'Push notifications')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
      },
    });
  }

  // ─── Graceful Shutdown ─────────────────────────────
  app.enableShutdownHooks();

  const port = configService.get('app.port') || 3000;
  await app.listen(port);

  logger.log(`VietShort API running on port ${port} [${configService.get('app.nodeEnv')}]`);
  if (!isProduction) {
    logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  Sentry.captureException(err);
  process.exit(1);
});