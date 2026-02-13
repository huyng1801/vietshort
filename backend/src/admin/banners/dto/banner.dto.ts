import { IsString, IsOptional, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VipType } from '@prisma/client';

export class BannerDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() imageUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsString() link?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() order?: number;
}

export class QueryBannerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value ? parseInt(value, 10) : undefined) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value ? parseInt(value, 10) : undefined) @IsInt() @Min(1) limit?: number;
}

export class CreateBannerDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() imageUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['video', 'external', 'promotion']) linkType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkTarget?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() startAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(Object.values(VipType)) targetVipType?: VipType;
}

export class UpdateBannerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['video', 'external', 'promotion']) linkType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkTarget?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() startAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(Object.values(VipType)) targetVipType?: VipType;
}