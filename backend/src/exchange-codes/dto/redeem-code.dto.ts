import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemCodeDto {
  @ApiProperty({ description: 'Mã đổi thưởng', example: 'ABC12345' })
  @IsString()
  code: string;
}
