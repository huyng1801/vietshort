import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsDateString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from '@prisma/client';

export class CreateCodeBatchDto {
  @ApiProperty({ description: 'Tên lô mã' }) 
  @IsString() 
  @MinLength(3)
  @MaxLength(50)
  batchName: string;

  @ApiProperty({ description: 'Số lượng mã', minimum: 1, maximum: 1000 }) 
  @IsNumber() 
  @Min(1) 
  @Max(1000) 
  quantity: number;

  @ApiProperty({ enum: RewardType }) 
  @IsEnum(RewardType) 
  rewardType: RewardType;

  @ApiProperty({ description: 'Giá trị gold', minimum: 0 }) 
  @IsNumber() 
  @Min(0) 
  goldValue: number;

  @ApiPropertyOptional({ description: 'Số ngày VIP' }) 
  @IsOptional() 
  @IsNumber() 
  vipDays?: number;

  @ApiPropertyOptional({ description: 'Giới hạn sử dụng/mã' }) 
  @IsOptional() 
  @IsNumber() 
  @Min(1) 
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Ngày hết hạn' }) 
  @IsOptional() 
  @IsDateString() 
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Prefix mã' }) 
  @IsOptional() 
  @IsString() 
  @MinLength(2)
  @MaxLength(10)
  codePrefix?: string;

  @ApiPropertyOptional({ description: 'Độ dài mã', minimum: 6, maximum: 20 }) 
  @IsOptional() 
  @IsNumber() 
  @Min(6) 
  @Max(20) 
  codeLength?: number;

  @ApiProperty({ description: 'Người tạo' }) 
  @IsString() 
  createdBy: string;
}

export class DeactivateCodeBatchDto {
  @ApiProperty({ description: 'Lý do vô hiệu hóa' })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  reason: string;
}
