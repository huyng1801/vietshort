import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@vietshort.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@vietshort.com' })
  @IsEmail() 
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Admin User' })
  @IsString()
  nickname: string;

  @ApiProperty({ example: '["user_management", "video_management"]' })
  @IsString()
  permissions: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: AdminRole.ADMIN, enum: AdminRole })
  @IsOptional()
  role?: AdminRole;
}

export interface LoginResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    nickname: string;
    role: AdminRole;
    permissions: string[];
  };
}