import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from '@ntucool/nestjs-logger';
import { AsyncScopeLogMetaInjector } from '@ntucool/nestjs-logger/helpers';

import express, { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import fs from 'fs';

import { AppModule } from './app.module';
import { SessionMiddlewareToken } from './session/session.middleware';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(`${process.env.KEY_DIRECTORY}/${process.env.HTTPS_KEY}`),
    cert: fs.readFileSync(`${process.env.KEY_DIRECTORY}/${process.env.HTTPS_CERT}`),
  };
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  // Enable graceful shutdown hooks to handle request drain
  app.enableShutdownHooks();

  const config = app.get<ConfigService>(ConfigService);
  const logger = app.get<LoggerService>(LoggerService);
  const session = app.get<RequestHandler | RequestHandler[]>(SessionMiddlewareToken);

  app.useLogger(logger);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());
  app.use(session);
  app.use(AsyncScopeLogMetaInjector.forRequest());

  const defaultCspDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();

  app.use(
    helmet({
      referrerPolicy: { policy: 'strict-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          ...defaultCspDirectives,
          'frame-ancestors': [
            ...defaultCspDirectives['frame-ancestors'],
            config.get<string>('canvas.host', ''),
          ],
        },
      },
    }),
  );

  app.set('trust proxy', true);

  if (config.get('app.enableCors')) {
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    });
  }

  const port = config.get<number>('app.port', 3000);
  await app.listen(port);

  const appUrl = await app.getUrl();
  logger.log(`Server ready on ${appUrl}`, 'NestApplication');
}
bootstrap();
