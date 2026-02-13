import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubtitleDto {
  @ApiProperty() @IsString() episodeId!: string;
  @ApiProperty() @IsString() language!: string;
  @ApiProperty() @IsString() content!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() subtitleUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() format?: string;
}

export class UpdateSubtitleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() subtitleUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
}
