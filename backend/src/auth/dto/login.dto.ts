import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email hoặc nickname', example: 'user@example.com' })
  @IsString()
  login: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'securePassword123' })
  @IsString()
  password: string;
}
