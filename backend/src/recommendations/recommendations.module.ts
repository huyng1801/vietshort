import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { CollaborativeFilter } from './algorithms/collaborative-filter';
import { HistoryBasedRecommender } from './algorithms/history-based';

@Module({
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    CollaborativeFilter,
    HistoryBasedRecommender,
  ],
  exports: [
    RecommendationsService,
    CollaborativeFilter,
    HistoryBasedRecommender,
  ],
})
export class RecommendationsModule {}
