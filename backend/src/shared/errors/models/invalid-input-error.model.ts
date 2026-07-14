import { ErrorCode } from '../error-code.enum';
import { ResponseError } from './response-error.model';

export class InvalidInputError extends ResponseError {
  constructor(detail: string) {
    super({
      code: ErrorCode.InvalidInput,
      message: `Invalid input: ${detail}`,
    });
  }
}
