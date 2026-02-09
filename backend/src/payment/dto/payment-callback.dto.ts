import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VnpayCallbackDto {
  @ApiProperty() @IsString() vnp_TxnRef: string;
  @ApiProperty() @IsString() vnp_ResponseCode: string;
  @ApiProperty() @IsString() vnp_TransactionStatus: string;
  @ApiProperty() @IsString() vnp_SecureHash: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vnp_Amount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vnp_BankCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vnp_PayDate?: string;
}

export class MomoCallbackDto {
  @ApiProperty() @IsString() orderId: string;
  @ApiProperty() @IsNumber() resultCode: number;
  @ApiPropertyOptional() @IsOptional() @IsString() message?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() transId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() amount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() signature?: string;
}
