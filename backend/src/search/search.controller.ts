import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/user.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Tìm kiếm video' })
  async search(@Query('q') query: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.searchService.search(query, page, limit);
  }

  @Public()
  @Get('suggest')
  @ApiOperation({ summary: 'Gợi ý tìm kiếm' })
  async suggest(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.searchService.suggest(query, limit);
  }
}
