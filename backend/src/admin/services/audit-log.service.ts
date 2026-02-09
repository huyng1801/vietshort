import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async getLogs(page = 1, limit = 50, filters?: { adminId?: string; action?: string; resource?: string }) {
    const where: any = {};
    if (filters?.adminId) where.adminId = filters.adminId;
    if (filters?.action) where.action = { contains: filters.action };
    if (filters?.resource) where.resource = filters.resource;

    return this.prisma.paginate('auditLog', { page, limit, where, orderBy: { createdAt: 'desc' } });
  }

  async getLogById(logId: string) {
    return this.prisma.auditLog.findUnique({ where: { id: logId } });
  }

  async verifyIntegrity(logId: string): Promise<boolean> {
    const log = await this.prisma.auditLog.findUnique({ where: { id: logId } });
    if (!log) return false;

    const crypto = require('crypto');
    const { checksum, ...data } = log;
    const computed = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    return computed === checksum;
  }
}
