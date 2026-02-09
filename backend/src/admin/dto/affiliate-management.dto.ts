import { IsString, IsOptional, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AffiliateQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) limit?: number;
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
