import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RequestHandler } from 'express';

import session from 'express-session';

import { SessionStoreProvider } from './session-store.provider';

@Injectable()
export class SessionProvider {
  constructor(
    private configService: ConfigService,
    private sessionStoreProvider: SessionStoreProvider,
  ) {}

  get(): RequestHandler {
    const sessionConfig = this.configService.get<{ secret: string }>('session');
    const secret = sessionConfig?.secret ?? '';

    /**
     * https://github.com/expressjs/session#sessionoptions
     */
    return session({
      secret: secret,
      store: this.sessionStoreProvider.get(),
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    });
  }
}
