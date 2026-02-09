import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAffiliateDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() nickname: string;
  @ApiProperty() @IsString() password: string;
  @ApiProperty() @IsString() fullName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccount?: string;
}

export class AffiliateLoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}
