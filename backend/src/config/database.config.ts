import { Injectable, OnModuleInit, OnModuleDestroy, Module, Global, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  [key: string]: any;
  private readonly logger = new Logger(PrismaService.name);
  private readReplica: PrismaClient | null = null;

  constructor(private configService: ConfigService) {
    const nodeEnv = configService.get('nodeEnv') || configService.get('NODE_ENV') || 'development';
    super({
      datasources: {
        db: {
          url: configService.get('database.url') || configService.get('DATABASE_URL'),
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
    const readReplicaUrl = configService.get('database.readReplicaUrl') || configService.get('DATABASE_READ_REPLICA_URL');
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
    const nodeEnv = this.configService.get('nodeEnv') || 'development';
    const slowMs = this.configService.get('database.slowQueryThreshold') || 2000;
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
