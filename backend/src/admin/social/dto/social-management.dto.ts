import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// ─── Comments ────────────────────────────────────────

export class QueryCommentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string; // search by content or user nickname

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isApproved?: string; // 'true' | 'false'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isReported?: string; // 'true' | 'false'

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string; // 'createdAt' | 'reportCount' | 'likeCount'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class ModerateCommentDto {
  @IsBoolean()
  isApproved: boolean;
}

export class BulkModerateDto {
  @IsString({ each: true })
  ids: string[];

  @IsBoolean()
  isApproved: boolean;
}

// ─── Ratings ─────────────────────────────────────────

export class QueryRatingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// ─── Favorites / Likes ──────────────────────────────

export class QueryFavoritesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string; // search by video title

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class QueryLikesDto extends QueryFavoritesDto {}
