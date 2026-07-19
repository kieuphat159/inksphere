import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: any;

  async connectToRedis(hostOrUrl: string, port?: number): Promise<void> {
    let pubClient: Redis;
    const retryStrategy = (times: number) => {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 100, 1000);
    };

    if (hostOrUrl.startsWith('redis://') || hostOrUrl.startsWith('rediss://')) {
      pubClient = new Redis(hostOrUrl, {
        lazyConnect: true,
        retryStrategy,
      });
    } else {
      pubClient = new Redis({
        host: hostOrUrl,
        port: port || 6379,
        lazyConnect: true,
        retryStrategy,
      });
    }
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
