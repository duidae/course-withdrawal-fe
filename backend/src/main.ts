import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { RequestHandler } from 'express';
import { SessionMiddlewareToken } from './session/session.middleware';

import cookieParser from 'cookie-parser';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const session = app.get<RequestHandler | RequestHandler[]>(SessionMiddlewareToken);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());
  app.use(session);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
