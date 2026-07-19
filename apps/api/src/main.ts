import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { XssSanitizationPipe } from './common/pipes/xss-validation.pipe';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(
    new XssSanitizationPipe(),
    new ValidationPipe({ transform: true, whitelist: true }),
  );
  app.useGlobalInterceptors(new TimingInterceptor());

  // Connect to Redis for WebSocket adapter
  const redisIoAdapter = new RedisIoAdapter(app);
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST ?? 'localhost';
  const redisPort = Number(process.env.REDIS_PORT ?? 6379);

  try {
    if (redisUrl) {
      await redisIoAdapter.connectToRedis(redisUrl);
    } else {
      await redisIoAdapter.connectToRedis(redisHost, redisPort);
    }
    app.useWebSocketAdapter(redisIoAdapter);

    console.log('Successfully connected to Redis for Socket.IO adapter');
  } catch (err) {
    console.warn(
      'Could not connect to Redis for Socket.IO adapter, falling back to default in-memory adapter:',
      err,
    );
  }

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
