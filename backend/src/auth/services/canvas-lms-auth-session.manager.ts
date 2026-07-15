import { Injectable } from '@nestjs/common';
import {
  AuthSession,
  AuthSessionManager,
  BaseAuthSession,
} from '@ntucool/nestjs-canvas-lms-auth';

import { Request } from 'express';
import { Store } from 'express-session';

import { SessionStoreProvider } from 'src/session/session-store.provider';

@Injectable()
export class CanvasLmsAuthSessionManager implements AuthSessionManager {
  constructor(private sessionStoreProvider: SessionStoreProvider) {}

  getSession(request: Request): AuthSession {
    return new BaseAuthSession(request.session);
  }

  getStore(): Store {
    return this.sessionStoreProvider.get();
  }
}
