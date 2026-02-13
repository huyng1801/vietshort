import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Public, CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Gợi ý video cho user' })
  async getRecommendations(@CurrentUser('id') userId: string, @Query('limit') limit = 20) {
    return this.service.getRecommendations(userId, +limit);
  }

  @Public()
  @Get('similar/:videoId')
  @ApiOperation({ summary: 'Video tương tự' })
  async getSimilar(@Param('videoId') videoId: string, @Query('limit') limit = 10) {
    return this.service.getSimilarVideos(videoId, +limit);
  }
}
