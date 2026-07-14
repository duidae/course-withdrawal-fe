import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@ntucool/nestjs-logger';
import { LoggerModuleOptions } from '@ntucool/nestjs-logger/dist/interfaces';

import { LoggerConfig } from './app.config';

import { CanvasApiModule } from './canvas-api/canvas-api.module';
import { FrontendModule } from './frontend/frontend.module';
import { SessionModule } from './session/session.module';
import { SisDbModule } from './database/sis-db/sis-db.module';
import { ExternalSisDbModule } from './database/external-sis-db/external-sis-db.module';

@Module({
  imports: [
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
    CanvasApiModule,
    FrontendModule,
    SessionModule,
    SisDbModule,
    ExternalSisDbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
