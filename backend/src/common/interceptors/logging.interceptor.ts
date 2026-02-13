import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          try {
            await this.createAuditLog({
              userId: user?.isAdmin ? undefined : user?.id,
              adminId: user?.isAdmin ? user?.id : undefined,
              action: `${method} ${url}`,
              resource: this.extractResource(url),
              resourceId: this.extractResourceId(body, response),
              changes: this.sanitizeChanges(body),
              ipAddress: ip,
              userAgent,
            });
          } catch (error) {
            console.error('Failed to create audit log:', error);
          }
        },
        error: async (error) => {
          try {
            await this.createAuditLog({
              userId: user?.isAdmin ? undefined : user?.id,
              adminId: user?.isAdmin ? user?.id : undefined,
              action: `${method} ${url} - ERROR`,
              resource: this.extractResource(url),
              changes: JSON.stringify({ error: error.message }),
              ipAddress: ip,
              userAgent,
            });
          } catch (auditError) {
            console.error('Failed to create error audit log:', auditError);
          }
        },
      }),
    );
  }

  private async createAuditLog(data: any) {
    const crypto = require('crypto');
    
    // Build audit log data only with fields that exist in schema
    const auditData: any = {
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      changes: data.changes ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    };

    // Only add userId if it exists (for regular users)
    if (data.userId) {
      auditData.userId = data.userId;
    }

    // Only add adminId if it exists (for admin actions)
    if (data.adminId) {
      auditData.adminId = data.adminId;
    }

    // Add checksum for tamper protection
    auditData.checksum = crypto.createHash('sha256').update(JSON.stringify(auditData)).digest('hex');

    try {
      await this.prisma.auditLog.create({ data: auditData });
    } catch (error) {
      console.error('Failed to create audit log:', (error as Error).message);
      // Don't throw - audit logging shouldn't break the app
    }
  }

  private extractResource(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[2] || 'unknown';
  }

  private extractResourceId(body: any, response: any): string | null {
    return body?.id || response?.id || null;
  }

  private sanitizeChanges(body: any): string | null {
    if (!body) return null;
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.passwordHash;
    delete sanitized.refreshToken;
    delete sanitized.accessToken;
    return JSON.stringify(sanitized);
  }
}
