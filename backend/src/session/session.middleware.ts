import { InternalServerErrorException } from '@nestjs/common';

import { RequestHandler, NextFunction } from 'express';

import { SessionProvider } from './session.provider';

export const SessionMiddlewareToken = 'SESSION_MIDDLEWARE_TOKEN';

const maxTries = 3;

export const SessionMiddlewareProvider = {
  provide: SessionMiddlewareToken,
  useFactory: (sessionProvider: SessionProvider): RequestHandler => {
    const realSessionMiddleware = sessionProvider.get();

    return (request, response, next) => {
      if (request.session) {
        return next();
      }

      const lookupSession = (tryCount = 0, error?: Error) => {
        if (error) {
          throw new InternalServerErrorException();
        }

        tryCount = tryCount + 1;

        if (request.session) {
          return next();
        }

        if (tryCount > maxTries) {
          throw new InternalServerErrorException();
        }

        realSessionMiddleware(request, response, ((error?: Error) =>
          lookupSession(tryCount, error)) as NextFunction);
      };

      lookupSession();
    };
  },
  inject: [SessionProvider],
};
