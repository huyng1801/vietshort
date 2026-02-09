import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgeRating } from '@prisma/client';

export class CreateVideoDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() poster?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() releaseYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() director?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() actors?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() genres?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isSerial?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalEpisodes?: number;
  @ApiPropertyOptional({ enum: AgeRating }) @IsOptional() @IsEnum(AgeRating) ageRating?: AgeRating;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVipOnly?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) unlockPrice?: number;
}
