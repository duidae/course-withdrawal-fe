import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@ntucool/nestjs-logger';
import { AsyncScopeLogMetaInjector } from '@ntucool/nestjs-logger/helpers';

import express, { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { SessionMiddlewareToken } from './session/session.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get<LoggerService>(LoggerService);
  const session = app.get<RequestHandler | RequestHandler[]>(SessionMiddlewareToken);

  app.useLogger(logger);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());
  app.use(session);
  app.use(AsyncScopeLogMetaInjector.forRequest());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
