import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeormLoggerAdapter } from '@ntucool/nestjs-logger/adapters';
import { ExternalSisDbConfigFactory, ExternalSisDbName } from './config/db.config';
import { ALL_ENTITIES } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: ExternalSisDbName,
      imports: [ConfigModule.forFeature(ExternalSisDbConfigFactory)],
      useFactory: (configService: ConfigService) => {
        const connection = configService.get<TypeOrmModuleOptions>('externalSisDb');

        return {
          ...connection,
          logging: ['error', 'warn'],
          logger: new TypeormLoggerAdapter(),
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([...ALL_ENTITIES], ExternalSisDbName),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class ExternalSisDbModule {}
