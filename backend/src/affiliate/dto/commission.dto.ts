import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPayoutDto {
  @ApiProperty({ description: 'Số tiền rút (VNĐ)', minimum: 100000 })
  @IsNumber()
  @Min(100000)
  amount: number;
}

export class UpdateCommissionRateDto {
  @ApiProperty({ description: 'Tỷ lệ hoa hồng (0-1)', example: 0.10 })
  @IsNumber()
  @Min(0)
  commissionRate: number;
}
