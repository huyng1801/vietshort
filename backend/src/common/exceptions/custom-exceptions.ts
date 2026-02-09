import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientBalanceException extends HttpException {
  constructor(message = 'Số dư không đủ') {
    super({ success: false, message, error: 'INSUFFICIENT_BALANCE' }, HttpStatus.BAD_REQUEST);
  }
}

export class AccountLockedException extends HttpException {
  constructor(reason?: string) {
    super({ success: false, message: `Tài khoản đã bị khóa${reason ? ': ' + reason : ''}`, error: 'ACCOUNT_LOCKED' }, HttpStatus.FORBIDDEN);
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string) {
    super({ success: false, message: `${resource} đã tồn tại`, error: 'DUPLICATE_RESOURCE' }, HttpStatus.CONFLICT);
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string) {
    super({ success: false, message: `Không tìm thấy ${resource}`, error: 'NOT_FOUND' }, HttpStatus.NOT_FOUND);
  }
}

export class PaymentFailedException extends HttpException {
  constructor(message = 'Thanh toán thất bại') {
    super({ success: false, message, error: 'PAYMENT_FAILED' }, HttpStatus.BAD_REQUEST);
  }
}

export class RateLimitExceededException extends HttpException {
  constructor() {
    super({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau', error: 'RATE_LIMIT' }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
