import { ErrorCode } from '../error-code.enum';

export class ResponseError extends Error {
  code: ErrorCode;

  constructor(error: Partial<ResponseError>) {
    super();
    this.name = this.constructor.name;
    this.message = error.message!;
    this.code = error.code!;
  }
}
