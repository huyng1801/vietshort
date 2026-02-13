import {
  IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsInt,
  Min, Max, MaxLength, MinLength, IsUrl, Matches, IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { AgeRating, VideoStatus, VipType } from '@prisma/client';

// ─── Create Video DTO ─────────────────────────────────────
export class CreateVideoDto {
  @ApiProperty({ description: 'Tên video', maxLength: 255 })
  @IsString()
  @IsNotEmpty({ message: 'Tên video không được để trống' })
  @MinLength(2, { message: 'Tên video tối thiểu 2 ký tự' })
  @MaxLength(255, { message: 'Tên video tối đa 255 ký tự' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả video' })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Mô tả tối đa 5000 ký tự' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ description: 'URL poster' })
  @IsOptional()
  @IsString()
  poster?: string;

  @ApiPropertyOptional({ description: 'Năm phát hành' })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  @Type(() => Number)
  releaseYear?: number;

  @ApiPropertyOptional({ description: 'Đạo diễn' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  director?: string;

  @ApiPropertyOptional({ description: 'Diễn viên (JSON array)' })
  @IsOptional()
  @IsString()
  actors?: string;

  @ApiPropertyOptional({ description: 'Quốc gia sản xuất' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Ngôn ngữ gốc' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ description: 'Thể loại (JSON array)' })
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiPropertyOptional({ description: 'Là phim nhiều tập', default: false })
  @IsOptional()
  @IsBoolean()
  isSerial?: boolean;

  @ApiPropertyOptional({ description: 'Tổng số tập' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  totalEpisodes?: number;

  @ApiPropertyOptional({ description: 'Phân loại độ tuổi', enum: AgeRating })
  @IsOptional()
  @IsEnum(AgeRating, { message: 'Phân loại độ tuổi không hợp lệ' })
  ageRating?: AgeRating;

  @ApiPropertyOptional({ description: 'Chỉ VIP mới xem được', default: false })
  @IsOptional()
  @IsBoolean()
  isVipOnly?: boolean;

  @ApiPropertyOptional({ description: 'Yêu cầu VIP tier cụ thể', enum: VipType })
  @IsOptional()
  @IsEnum(VipType)
  vipTier?: VipType;

  @ApiPropertyOptional({ description: 'Giá unlock toàn bộ (gold)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  @Type(() => Number)
  unlockPrice?: number;

  @ApiPropertyOptional({ description: 'Meta title (SEO)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description (SEO)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Keywords (SEO)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string;
}

// ─── Update Video DTO ─────────────────────────────────────
export class UpdateVideoDto {
  @ApiPropertyOptional({ description: 'Tên video' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  poster?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  @Type(() => Number)
  releaseYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  director?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actors?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVipOnly?: boolean;

  @ApiPropertyOptional({ enum: VipType })
  @IsOptional()
  @IsEnum(VipType)
  vipTier?: VipType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  @Type(() => Number)
  unlockPrice?: number;

  @ApiPropertyOptional({ enum: AgeRating })
  @IsOptional()
  @IsEnum(AgeRating)
  ageRating?: AgeRating;

  @ApiPropertyOptional({ enum: VideoStatus })
  @IsOptional()
  @IsEnum(VideoStatus, { message: 'Trạng thái video không hợp lệ' })
  status?: VideoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string;
}

// ─── Query Video DTO ──────────────────────────────────────
export class QueryVideoDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên/mô tả' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo thể loại' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ description: 'Lọc theo quốc gia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái', enum: VideoStatus })
  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @ApiPropertyOptional({ description: 'Lọc theo VIP only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVipOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sắp xếp theo', default: 'createdAt' })
  @IsOptional()
  @IsString()
  @Matches(/^(createdAt|viewCount|ratingAverage|publishedAt|title)$/, {
    message: 'Sort phải là: createdAt, viewCount, ratingAverage, publishedAt, title',
  })
  sort?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsString()
  @Matches(/^(asc|desc)$/, { message: 'Order phải là asc hoặc desc' })
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Trang', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ─── Create Episode DTO ───────────────────────────────────
export class CreateEpisodeDto {
  @ApiProperty({ description: 'ID video chứa tập phim' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ description: 'Số tập' })
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  episodeNumber: number;

  @ApiPropertyOptional({ description: 'Tên tập' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả tập' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'URL HLS manifest' })
  @IsOptional()
  @IsString()
  hlsManifest?: string;

  @ApiPropertyOptional({ description: 'URL MP4 fallback' })
  @IsOptional()
  @IsString()
  mp4Url?: string;

  @ApiPropertyOptional({ description: 'Giá unlock tập (gold)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  @Type(() => Number)
  unlockPrice?: number;

  @ApiPropertyOptional({ description: 'Tập miễn phí', default: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Thời lượng (giây)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  duration?: number;
}

// ─── Watch Progress DTO ───────────────────────────────────
export class UpdateWatchProgressDto {
  @ApiPropertyOptional({ description: 'Episode ID' })
  @IsOptional()
  @IsString()
  episodeId?: string;

  @ApiProperty({ description: 'Tiến trình xem (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  progressive: number;
}
