import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GuestModeDto {
  @ApiProperty({ description: 'Device ID để định danh khách', example: 'device-uuid-12345' })
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({ description: 'Platform', example: 'web' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'User agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class LinkAccountDto {
  @ApiProperty({ description: 'Device ID khách' })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'Email liên kết' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Mật khẩu', minLength: 8 })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Nickname' })
  @IsOptional()
  @IsString()
  nickname?: string;
}

export class ReferralCodeDto {
  @ApiProperty({ description: 'Mã giới thiệu CTV', example: 'CTV12345678' })
  @IsString()
  referralCode: string;
}
