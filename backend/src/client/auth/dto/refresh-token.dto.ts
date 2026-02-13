import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email đặt lại mật khẩu', example: 'user@example.com' })
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token đặt lại mật khẩu' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Mật khẩu mới (tối thiểu 8 ký tự)', minLength: 8 })
  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới (tối thiểu 8 ký tự)', minLength: 8 })
  @IsString()
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token xác minh email' })
  @IsString()
  token: string;
}
