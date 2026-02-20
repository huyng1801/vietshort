import { IsString, MinLength, MaxLength, IsEnum, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from '@prisma/client';

export class CreateExchangeCodeDto {
  @ApiProperty() @IsString() @MinLength(6) @MaxLength(20) code!: string;
  @ApiProperty({ enum: RewardType }) @IsEnum(RewardType) rewardType!: RewardType;
  @ApiProperty() @IsNumber() @Min(1) quantity!: number;
  @ApiProperty() @IsNumber() @Min(1) rewardValue!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() batchName?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxUses?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiresAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() createdBy?: string;
}
