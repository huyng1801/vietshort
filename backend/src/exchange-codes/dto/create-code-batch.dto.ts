import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from '@prisma/client';

export class CreateCodeBatchDto {
  @ApiProperty({ description: 'Tên lô mã' }) @IsString() batchName: string;
  @ApiProperty({ description: 'Số lượng mã', minimum: 1, maximum: 1000 }) @IsNumber() @Min(1) @Max(1000) quantity: number;
  @ApiProperty({ enum: RewardType }) @IsEnum(RewardType) rewardType: RewardType;
  @ApiProperty({ description: 'Giá trị gold', minimum: 0 }) @IsNumber() @Min(0) goldValue: number;
  @ApiPropertyOptional({ description: 'Số ngày VIP' }) @IsOptional() @IsNumber() vipDays?: number;
  @ApiPropertyOptional({ description: 'Giới hạn sử dụng/mã' }) @IsOptional() @IsNumber() @Min(1) usageLimit?: number;
  @ApiPropertyOptional({ description: 'Ngày hết hạn' }) @IsOptional() @IsDateString() expiresAt?: string;
  @ApiProperty({ description: 'Người tạo' }) @IsString() createdBy: string;
}
