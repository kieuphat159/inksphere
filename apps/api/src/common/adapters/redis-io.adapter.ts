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

    const redisOptions = {
      lazyConnect: true,
      retryStrategy,
      enableReadyCheck: false, // Prevents NOPERM crashes on INFO command
    };

    if (hostOrUrl.startsWith('redis://') || hostOrUrl.startsWith('rediss://')) {
      pubClient = new Redis(hostOrUrl, redisOptions);
    } else {
      pubClient = new Redis({
        host: hostOrUrl,
        port: port || 6379,
        ...redisOptions,
      });
    }

    pubClient.on('error', (err) => {
      console.warn('Redis pubClient error:', err.message);
    });

    const subClient = pubClient.duplicate();
    subClient.on('error', (err) => {
      console.warn('Redis subClient error:', err.message);
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Test publish to verify credentials have Pub/Sub permissions
    try {
      await pubClient.publish('socket.io-test-ping', 'ping');
    } catch (err: any) {
      pubClient.disconnect();
      subClient.disconnect();
      throw new Error(`Redis Pub/Sub permission denied: ${err.message}`);
    }

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
