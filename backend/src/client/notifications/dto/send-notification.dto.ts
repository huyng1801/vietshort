import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  VIDEO = 'VIDEO',
  PAYMENT = 'PAYMENT',
  PROMOTION = 'PROMOTION',
  SOCIAL = 'SOCIAL',
}

export class SendNotificationDto {
  @ApiProperty() @IsString() userId: string;
  @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type: NotificationType;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() message: string;
  @ApiPropertyOptional() @IsOptional() @IsString() link?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
}

export class BroadcastNotificationDto {
  @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type: NotificationType;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() message: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) userIds?: string[];
}
