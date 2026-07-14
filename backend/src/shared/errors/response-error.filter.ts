import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import express from 'express';
import { ErrorCode } from './error-code.enum';
import { ResponseError } from './models/response-error.model';

@Catch(ResponseError)
export class ResponseErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  catch(error: ResponseError, host: ArgumentsHost): void {
    let status: HttpStatus;

    switch (error.code) {
      case ErrorCode.NotFound:
        status = HttpStatus.NOT_FOUND;
        break;

      case ErrorCode.Forbidden:
        status = HttpStatus.FORBIDDEN;
        break;

      default:
        status = HttpStatus.BAD_REQUEST;
    }

    this.logger.error(JSON.stringify(error.message), error.stack);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<express.Response>();

    response.status(status).json(error);
  }
}
