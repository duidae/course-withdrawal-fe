import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeormLoggerAdapter } from '@ntucool/nestjs-logger/adapters';
import { SisDbConfigFactory, SisDbName } from './config/db.config';
import { ALL_ENTITIES } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: SisDbName,
      imports: [ConfigModule.forFeature(SisDbConfigFactory)],
      useFactory: (configService: ConfigService) => {
        const connection = configService.get<TypeOrmModuleOptions>('sisDb');

        return {
          ...connection,
          logging: ['error', 'warn'],
          logger: new TypeormLoggerAdapter(),
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([...ALL_ENTITIES], SisDbName),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class SisDbModule {}
