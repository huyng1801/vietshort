import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly maxRequests = 100;
  private readonly windowMs = 60;

  constructor(private redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${ip}`;

    const current = await this.redisService.incrementRateLimit(key, this.windowMs);

    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - current));

    if (current > this.maxRequests) {
      throw new HttpException('Quá nhiều yêu cầu, vui lòng thử lại sau', HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
