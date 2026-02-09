import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  IsDateString,
  Matches,
  IsUrl,
  IsISO31661Alpha2,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Tên hiển thị (3-30 ký tự, chữ, số, dấu gạch dưới)' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[\p{L}\p{N}_\s]+$/u, { message: 'Nickname chỉ được chứa chữ, số, dấu cách và gạch dưới' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  nickname?: string;

  @ApiPropertyOptional({ description: 'Họ (tối đa 50 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[\p{L}\s'-]+$/u, { message: 'Họ chỉ được chứa chữ cái' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Tên (tối đa 50 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[\p{L}\s'-]+$/u, { message: 'Tên chỉ được chứa chữ cái' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại Việt Nam (0xxx hoặc +84xxx)' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])\d{7}$/, {
    message: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện (phải là URL hợp lệ)' })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'Avatar phải là URL HTTPS hợp lệ' })
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh (ISO 8601), phải trên 13 tuổi' })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Giới tính' })
  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Mã quốc gia ISO 3166-1 alpha-2 (VD: VN, US, JP)' })
  @IsOptional()
  @IsISO31661Alpha2({ message: 'Mã quốc gia không hợp lệ (ISO 3166-1 alpha-2)' })
  country?: string;

  @ApiPropertyOptional({ description: 'Mã ngôn ngữ (vi, en, zh, ja, ko, th)' })
  @IsOptional()
  @IsString()
  @Matches(/^(vi|en|zh|ja|ko|th)$/, { message: 'Ngôn ngữ không được hỗ trợ' })
  language?: string;
}
