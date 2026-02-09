import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  // Refresh token management
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.redisService.del(`session:${userId}`);
  }

  async revokeToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  async countUserTokens(userId: string): Promise<number> {
    return this.prisma.refreshToken.count({ where: { userId } });
  }

  // Session management
  async createSession(userId: string, deviceInfo: any = {}): Promise<string> {
    const sessionId = `${userId}:${Date.now()}`;
    await this.redisService.setSession(sessionId, {
      userId,
      deviceInfo,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    });
    return sessionId;
  }

  async getSession(sessionId: string): Promise<any | null> {
    return this.redisService.getSession(sessionId);
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.redisService.deleteSession(sessionId);
  }

  async updateLastActive(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActive = new Date().toISOString();
      await this.redisService.setSession(sessionId, session);
    }
  }

  // Blacklist management
  async blacklistUser(userId: string, ttl = 86400): Promise<void> {
    await this.redisService.set(`blacklist:${userId}`, true, ttl);
  }

  async isBlacklisted(userId: string): Promise<boolean> {
    return this.redisService.exists(`blacklist:${userId}`);
  }
}
