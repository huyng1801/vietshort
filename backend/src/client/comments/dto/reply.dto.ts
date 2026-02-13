import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyDto {
  @ApiProperty({ description: 'Comment cha ID' }) @IsString() parentId: string;
  @ApiProperty({ description: 'Nội dung trả lời', maxLength: 500 }) @IsString() @MaxLength(500) content: string;
}
