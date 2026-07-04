import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { logDbQuery } from 'src/common/timing.context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Register Prisma middleware to log query timing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaClient = this as any;
    if (typeof prismaClient.$use === 'function') {
      prismaClient.$use(async (params: { model?: string; action: string }, next: (param: unknown) => Promise<unknown>) => {
        const startMs = Date.now();
        const result = await next(params);
        const durationMs = Date.now() - startMs;

        // Log all DB queries with their timing
        if (durationMs >= 0) {
          logDbQuery(params.model ?? 'Raw', params.action, durationMs);
        }

        return result;
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
