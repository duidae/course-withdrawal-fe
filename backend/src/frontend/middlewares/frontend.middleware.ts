import { HttpStatus, Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  private readonly logger = new Logger(this.constructor.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  use(request: Request, response: Response, next: NextFunction) {
    response.sendFile(path.resolve('../frontend/build/index.html'), (error) => {
      if (error) {
        this.logger.error(error.message, error.stack);
        response.send('Page not found.').status(HttpStatus.NOT_FOUND);
      }
    });
  }
}
