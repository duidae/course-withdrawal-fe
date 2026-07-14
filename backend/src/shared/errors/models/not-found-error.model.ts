import { ErrorCode } from '../error-code.enum';
import { ResponseError } from './response-error.model';

export class NotFoundError extends ResponseError {
  constructor(resource: string) {
    super({
      code: ErrorCode.NotFound,
      message: `The ${resource} does not exist.`,
    });
  }
}
