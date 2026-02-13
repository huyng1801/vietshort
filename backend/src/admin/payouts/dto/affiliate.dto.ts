import { IsString, IsOptional, IsNumber, IsBoolean, IsInt, Min, IsEmail, Max, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateType } from '@prisma/client';

export class AffiliateQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() isActive?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() isVerified?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dateFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dateTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tier?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() affiliateType?: string;
}

export class CreateAffiliateDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() nickname: string;
  @ApiProperty() @IsString() password: string;
  @ApiProperty() @IsString() realName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(1) commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(AffiliateType) affiliateType?: AffiliateType;
  @ApiPropertyOptional() @IsOptional() @IsString() contractNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() contractStartAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() contractEndAt?: string;
}

export class UpdateAffiliateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() realName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(1) commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVerified?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() contractNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() contractStartAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() contractEndAt?: string;
}

export class UpdateCommissionDto {
  @ApiProperty() @IsNumber() commissionRate: number;
}

export class PayoutActionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class ToggleAffiliateDto {
  @ApiProperty() @IsBoolean() isActive: boolean;
}