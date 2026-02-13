import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Public, CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':videoId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Đánh giá video' })
  async rate(
    @CurrentUser('id') userId: string,
    @Param('videoId') videoId: string,
    @Body() body: { rating: number; review?: string },
  ) {
    return this.ratingsService.rate(userId, videoId, body.rating, body.review);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/:videoId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Đánh giá của tôi' })
  async myRating(@CurrentUser('id') userId: string, @Param('videoId') videoId: string) {
    return this.ratingsService.getUserRating(userId, videoId);
  }

  @Public()
  @Get('video/:videoId')
  @ApiOperation({ summary: 'Đánh giá của video' })
  async videoRatings(@Param('videoId') videoId: string, @Query('page') page?: number) {
    return this.ratingsService.getVideoRatings(videoId, page);
  }
}
