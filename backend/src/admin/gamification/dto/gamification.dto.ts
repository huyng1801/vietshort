import { IsString, IsOptional, IsInt, Min, IsEnum, IsBoolean, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DailyTaskType, AchievementCondition } from '@prisma/client';

// ===== Daily Task DTOs =====

export class CreateDailyTaskDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsEnum(DailyTaskType) taskType: DailyTaskType;
  @ApiProperty() @IsInt() @Min(1) targetCount: number;
  @ApiProperty() @IsInt() @Min(0) rewardGold: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateDailyTaskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(DailyTaskType) taskType?: DailyTaskType;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) targetCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) rewardGold?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
}

export class QueryDailyTaskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsEnum(DailyTaskType) taskType?: DailyTaskType;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value ? parseInt(value, 10) : undefined) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value ? parseInt(value, 10) : undefined) @IsInt() @Min(1) limit?: number;
}

// ===== Achievement DTOs =====

export class CreateAchievementDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiProperty() @IsEnum(AchievementCondition) conditionType: AchievementCondition;
  @ApiProperty() @IsInt() @Min(1) conditionValue: number;
  @ApiProperty() @IsInt() @Min(0) rewardGold: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateAchievementDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(AchievementCondition) conditionType?: AchievementCondition;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) conditionValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) rewardGold?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
}

export class QueryAchievementDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(AchievementCondition) conditionType?: AchievementCondition;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value ? parseInt(value, 10) : undefined) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value ? parseInt(value, 10) : undefined) @IsInt() @Min(1) limit?: number;
}

// ===== Check-in Reward DTOs =====

export class UpdateCheckInRewardDto {
  @ApiProperty() @IsInt() @Min(1) day: number;
  @ApiProperty() @IsInt() @Min(0) rewardGold: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class BulkUpdateCheckInRewardsDto {
  @ApiProperty({ type: [UpdateCheckInRewardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCheckInRewardDto)
  rewards: UpdateCheckInRewardDto[];
}
