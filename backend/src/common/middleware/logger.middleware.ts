import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`);
    });

    next();
  }
}
