import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class InputValidationException extends HttpException {
  constructor(errors: ValidationError[]) {
    const messages = errors.map((error) => ({
      field: error.property,
      constraints: error.constraints ? Object.values(error.constraints) : [],
    }));

    super(
      { success: false, message: 'Dữ liệu không hợp lệ', errors: messages },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class SqlInjectionException extends HttpException {
  constructor() {
    super(
      { success: false, message: 'Yêu cầu không hợp lệ', error: 'INVALID_INPUT' },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class XssException extends HttpException {
  constructor() {
    super(
      { success: false, message: 'Nội dung không hợp lệ', error: 'INVALID_CONTENT' },
      HttpStatus.BAD_REQUEST,
    );
  }
}
