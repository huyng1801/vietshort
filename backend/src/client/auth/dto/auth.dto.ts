import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsNotEmpty,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class RegisterDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) nickname?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional() @IsOptional() @IsString() referralCode?: string;
}

export class LoginDto {
  @ApiProperty() @IsString() @IsNotEmpty() login!: string; // Can be email or nickname
  @ApiProperty() @IsString() @IsNotEmpty() password!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deviceId?: string;
}

export class RefreshTokenDto {
  @ApiProperty() @IsString() refreshToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email!: string;
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() token!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() currentPassword!: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword!: string;
}

export class GuestLoginDto {
  @ApiProperty() @IsString() deviceId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referralCode?: string;
}

export class LinkAccountDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiProperty() @IsString() deviceId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nickname?: string;
}

export class UpgradeGuestDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiProperty() @IsString() @MaxLength(30) nickname!: string;
  @ApiProperty() @IsString() deviceId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) lastName?: string;
}

export class SubmitReferralCodeDto {
  @ApiProperty() @IsString() @IsNotEmpty() referralCode!: string;
}

export class LinkOAuthDto {
  @ApiProperty() @IsString() provider!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() deviceId!: string;
}
