import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/user.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Tìm kiếm video (hỗ trợ browse theo thể loại không cần từ khoá)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'genre', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['relevance', 'newest', 'views', 'rating'] })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quality', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') query = '',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('genre') genre?: string,
    @Query('sort') sort?: string,
    @Query('year') year?: string,
    @Query('quality') quality?: string,
  ) {
    return this.searchService.search(query, page, limit, { genre, sort: sort as any, year, quality });
  }

  @Public()
  @Get('suggest')
  @ApiOperation({ summary: 'Gợi ý tìm kiếm' })
  async suggest(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.searchService.suggest(query, limit);
  }
}
