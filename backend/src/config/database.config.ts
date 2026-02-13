import { Injectable, OnModuleInit, OnModuleDestroy, Module, Global, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

/**
 * Database Configuration - Master-slave connection config + PrismaService
 *
 * ENV vars: DATABASE_URL, DATABASE_READ_REPLICA_URL, DATABASE_SLOW_QUERY_MS
 * Access via: configService.get('database.url'), configService.get('database.slowQueryMs'), etc.
 */
export const databaseConfig = () => ({
  database: {
    url: process.env.DATABASE_URL,
    readReplicaUrl: process.env.DATABASE_READ_REPLICA_URL,
    slowQueryMs: parseInt(process.env.DATABASE_SLOW_QUERY_MS || '2000', 10),
  },
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  [key: string]: any;
  private readonly logger = new Logger(PrismaService.name);
  private readReplica: PrismaClient | null = null;

  constructor(private configService: ConfigService) {
    const nodeEnv = configService.get('app.nodeEnv') || 'development';
    super({
      datasources: {
        db: {
          url: configService.get('database.url'),
        },
      },
      log: nodeEnv === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
    });

    // Initialize read replica if configured
    const readReplicaUrl = configService.get('database.readReplicaUrl');
    if (readReplicaUrl) {
      this.readReplica = new PrismaClient({
        datasources: {
          db: { url: readReplicaUrl },
        },
        log: [{ level: 'error', emit: 'stdout' }],
      });
      this.logger.log('Read replica configured');
    }
  }

  async onModuleInit() {
    await this.$connect();
    if (this.readReplica) {
      await this.readReplica.$connect();
    }

    // Slow query logging in development
    const nodeEnv = this.configService.get('app.nodeEnv') || 'development';
    const slowMs = this.configService.get('database.slowQueryMs') || 2000;
    if (nodeEnv === 'development') {
      (this as any).$on('query', (e: any) => {
        if (e.duration > slowMs) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this.readReplica) {
      await this.readReplica.$disconnect();
    }
  }

  /**
   * Get the read-only Prisma client.
   * Falls back to primary if no replica is configured.
   * Use for SELECT queries that don't require real-time consistency.
   */
  get reader(): PrismaClient {
    return this.readReplica || this;
  }

  // Helper method for soft deletes
  async softDelete(model: string, id: string) {
    return this[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Helper method for paginated results
  async paginate<T>(
    model: string,
    {
      page = 1,
      limit = 10,
      where = {},
      orderBy = {},
      include = {},
      select = {},
      useReplica = false,
    }: {
      page?: number;
      limit?: number;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      useReplica?: boolean;
    },
  ): Promise<{
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;
    const client = useReplica ? this.reader : this;

    const findOptions: any = {
      where,
      orderBy,
      skip,
      take: limit,
    };

    // Use select if provided, otherwise use include
    if (Object.keys(select).length > 0) {
      findOptions.select = select;
    } else if (Object.keys(include).length > 0) {
      findOptions.include = include;
    }

    const [data, total] = await Promise.all([
      (client as any)[model].findMany(findOptions),
      (client as any)[model].count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
