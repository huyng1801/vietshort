import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AgeRating, VideoStatus } from '@prisma/client';

export class UpdateVideoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() poster?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() releaseYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() director?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() actors?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() genres?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVipOnly?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) unlockPrice?: number;
  @ApiPropertyOptional({ enum: AgeRating }) @IsOptional() @IsEnum(AgeRating) ageRating?: AgeRating;
  @ApiPropertyOptional({ enum: VideoStatus }) @IsOptional() @IsEnum(VideoStatus) status?: VideoStatus;
}
