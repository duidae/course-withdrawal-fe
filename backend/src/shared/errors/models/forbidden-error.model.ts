import { ErrorCode } from '../error-code.enum';
import { ResponseError } from './response-error.model';

export class ForbiddenError extends ResponseError {
  constructor() {
    super({
      code: ErrorCode.Forbidden,
      message: 'Permission denied.',
    });
  }
}
