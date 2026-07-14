import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeormLoggerAdapter } from '@ntucool/nestjs-logger/adapters';
import {
  CourseWithdrawalDbConfigFactory,
  CourseWithdrawalDbName,
} from './config/db.config';
import { ALL_ENTITIES } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: CourseWithdrawalDbName,
      imports: [ConfigModule.forFeature(CourseWithdrawalDbConfigFactory)],
      useFactory: (configService: ConfigService) => {
        const connection = configService.get<TypeOrmModuleOptions>('courseWithdrawalDb');

        return {
          ...connection,
          logging: ['error', 'warn'],
          logger: new TypeormLoggerAdapter(),
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([...ALL_ENTITIES], CourseWithdrawalDbName),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class CourseWithdrawalDbModule {}
