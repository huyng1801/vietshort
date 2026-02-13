import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(5000) content!: string;
  @ApiProperty() @IsString() videoId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(5000) content!: string;
}
