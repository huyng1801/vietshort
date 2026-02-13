import { IsString, IsOptional, IsEnum, IsInt, Min, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VipType, AdminRole } from '@prisma/client';

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

export class AdminGoldAdjustmentDto {
  @ApiProperty() @IsInt() amount: number;
  @ApiProperty() @IsString() reason: string;
}

export class AdminVipAdjustmentDto {
  @ApiProperty({ enum: VipType }) @IsEnum(VipType) vipType: VipType;
  @ApiProperty() @IsInt() @Min(1) vipDays: number;
}