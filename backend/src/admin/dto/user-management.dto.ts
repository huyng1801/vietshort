import { IsString, IsOptional, IsEnum, IsInt, Min, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class CreateAdminDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
  @ApiProperty() @IsString() nickname: string;
  @ApiProperty() @IsString() permissions: string;
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiProperty({ enum: AdminRole }) @IsEnum(AdminRole) role: AdminRole;
}

export class AdminLoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}

export class AdminActionDto {
  @ApiProperty() @IsString() reason: string;
}

export class UserSearchDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) limit?: number;
}

export class UpdateBalanceDto {
  @ApiProperty() @IsInt() @Min(0) goldBalance: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
