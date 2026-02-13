import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('app.nodeEnv') === 'production';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Known HTTP exceptions — pass through without Sentry
        if (error instanceof HttpException) {
          const status = error.getStatus();

          // Only capture 5xx errors to Sentry (server bugs, not client errors)
          if (status >= 500) {
            this.captureToSentry(error, context);
          }

          return throwError(() => error);
        }

        // Unhandled / unknown errors → always capture to Sentry
        this.logger.error(
          `Unhandled error: ${error.message}`,
          error.stack,
        );
        this.captureToSentry(error, context);

        const sanitizedError = new HttpException(
          {
            success: false,
            message:
              this.isProduction
                ? 'Đã xảy ra lỗi hệ thống'
                : error.message,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        return throwError(() => sanitizedError);
      }),
    );
  }

  private captureToSentry(error: Error, context: ExecutionContext): void {
    try {
      const request = context.switchToHttp().getRequest();
      if (request) {
        Sentry.withScope((scope) => {
          scope.setTag('handler', context.getHandler()?.name);
          scope.setTag('controller', context.getClass()?.name);
          scope.setExtra('url', request.url);
          scope.setExtra('method', request.method);

          if (request.user?.id) {
            scope.setUser({ id: request.user.id });
          }

          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
    } catch {
      // Never let Sentry reporting crash the app
      Sentry.captureException(error);
    }
  }
}
