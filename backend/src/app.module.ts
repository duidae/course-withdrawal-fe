import { Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@ntucool/nestjs-logger';
import { LoggerModuleOptions } from '@ntucool/nestjs-logger/dist/interfaces';

import { AppConfig, LoggerConfig } from './app.config';
import { ResponseErrorFilter } from './shared/errors';

import { AuthModule } from './auth/auth.module';
import { CanvasApiModule } from './canvas-api/canvas-api.module';
import { FrontendModule } from './frontend/frontend.module';
import { SessionModule } from './session/session.module';
import { SisDbModule } from './database/sis-db/sis-db.module';
import { ExternalSisDbModule } from './database/external-sis-db/external-sis-db.module';
import { CourseWithdrawalDbModule } from './database/course-withdrawal-db/course-withdrawal-db.module';
import { CourseWithdrawalModule } from './course-withdrawal/course-withdrawal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConfigModule.forFeature(AppConfig),
    LoggerModule.forRootAsync({
      imports: [ConfigModule.forFeature(LoggerConfig)],
      useFactory: (configService: ConfigService): LoggerModuleOptions => {
        return {
          ...configService.get('logger'),
          access: {
            excludes: [
              { path: '/static/(.*)', method: RequestMethod.GET },
              { path: '/(.*).png', method: RequestMethod.GET },
              { path: '/(.*).ico', method: RequestMethod.GET },
            ],
          },
        } as LoggerModuleOptions;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CanvasApiModule,
    FrontendModule,
    SessionModule,
    SisDbModule,
    ExternalSisDbModule,
    CourseWithdrawalDbModule,
    CourseWithdrawalModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ResponseErrorFilter,
    },
  ],
})
export class AppModule {}
