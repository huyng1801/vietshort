import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, PaymentProvider } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ enum: TransactionType }) @IsEnum(TransactionType) type: TransactionType;
  @ApiProperty({ minimum: 1000 }) @IsNumber() @Min(1000) amount: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() goldAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() vipDays?: number;
  @ApiProperty({ enum: PaymentProvider }) @IsEnum(PaymentProvider) provider: PaymentProvider;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
