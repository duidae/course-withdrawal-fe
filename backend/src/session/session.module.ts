import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { SessionConfig, RedisConfig } from './session.config';
import { SessionProvider } from './session.provider';
import { SessionStoreProvider } from './session-store.provider';
import { SessionMiddlewareProvider } from './session.middleware';

@Module({
  imports: [ConfigModule.forFeature(SessionConfig), ConfigModule.forFeature(RedisConfig)],
  providers: [SessionProvider, SessionStoreProvider, SessionMiddlewareProvider],
  exports: [SessionStoreProvider],
})
export class SessionModule {}
