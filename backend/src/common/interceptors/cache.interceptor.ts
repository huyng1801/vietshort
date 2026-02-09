import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const key = `cache:${request.url}`;
    const cached = await this.redisService.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.set(key, data, 300); // 5 min TTL
      }),
    );
  }
}
