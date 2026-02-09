import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Video ID' }) @IsString() videoId: string;
  @ApiProperty({ description: 'Nội dung bình luận', maxLength: 500 }) @IsString() @MaxLength(500) content: string;
}
