import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, IsUrl } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional() @IsOptional() @IsUrl() avatar?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
}

export class UserQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() page?: number;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sort?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() order?: 'asc' | 'desc';
}
