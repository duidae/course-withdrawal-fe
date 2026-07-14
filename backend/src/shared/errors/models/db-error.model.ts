import { ErrorCode } from '../error-code.enum';
import { ResponseError } from './response-error.model';

export class DbError extends ResponseError {
  constructor(detail: string) {
    super({
      code: ErrorCode.DbError,
      message: `DB error: ${detail}`,
    });
  }
}
