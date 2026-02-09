import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() adminId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() action?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resource?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) limit?: number;
}
