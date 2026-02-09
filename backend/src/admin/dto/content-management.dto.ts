import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoReviewDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class VideoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) limit?: number;
}

export class BannerDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() imageUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsString() link?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() order?: number;
}
