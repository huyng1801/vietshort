import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadSubtitleDto {
  @ApiProperty({ description: 'Episode ID' }) @IsString() episodeId: string;
  @ApiProperty({ description: 'Ngôn ngữ phụ đề', example: 'vi' }) @IsString() language: string;
  @ApiProperty({ description: 'Nội dung SRT' }) @IsString() content: string;
  @ApiPropertyOptional({ description: 'Nhãn hiển thị', example: 'Tiếng Việt' }) @IsOptional() @IsString() label?: string;
}

export class AutoGenerateSubtitleDto {
  @ApiProperty({ description: 'Episode ID' }) @IsString() episodeId: string;
  @ApiProperty({ description: 'Ngôn ngữ nguồn', example: 'zh' }) @IsString() sourceLanguage: string;
  @ApiPropertyOptional({ description: 'Ngôn ngữ đích', example: 'vi' }) @IsOptional() @IsString() targetLanguage?: string;
}
