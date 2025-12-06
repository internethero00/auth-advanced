import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { ms, StringValue } from './libs/common/utils/ms.util';
import { parseBoolean } from './libs/common/utils/parse-boolean.util';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const redisClient = createClient({
    url: config.getOrThrow<string>('REDIS_URI'),
  });

  redisClient.on('error', (err) => console.error('REDIS CLIENT ERROR', err));

  await redisClient.connect();

  const store = new RedisStore({
    client: redisClient,
    prefix: config.getOrThrow<string>('SESSION_FOLDER'),
  });

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(
    session({
      store,
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });
  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}
bootstrap();
