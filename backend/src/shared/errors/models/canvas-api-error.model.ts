import { ErrorCode } from '../error-code.enum';
import { ResponseError } from './response-error.model';

export class CanvasApiError extends ResponseError {
  constructor(detail: string) {
    super({
      code: ErrorCode.CanvasApiError,
      message: `Canvas API error: ${detail}`,
    });
  }
}
