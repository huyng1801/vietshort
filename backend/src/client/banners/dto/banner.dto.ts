import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VipType } from '@prisma/client';

export class GetBannersDto {
  @ApiPropertyOptional({ description: 'Lọc theo VIP type', enum: VipType })
  @IsOptional()
  @IsEnum(VipType)
  vipType?: VipType;

  @ApiPropertyOptional({ description: 'Số lượng banner', default: 10 })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : 10)
  @IsInt()
  @Min(1)
  limit?: number;
}
