import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  FOLLOW = 'FOLLOW',
  PAYMENT = 'PAYMENT',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @ApiProperty() @IsString() userId!: string;
  @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type!: NotificationType;
  @ApiProperty() @IsString() message!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceId?: string;
}
