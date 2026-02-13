import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationManagementService } from './gamification-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateDailyTaskDto,
  UpdateDailyTaskDto,
  QueryDailyTaskDto,
  CreateAchievementDto,
  UpdateAchievementDto,
  QueryAchievementDto,
  UpdateCheckInRewardDto,
  BulkUpdateCheckInRewardsDto,
} from './dto/gamification.dto';

@ApiTags('admin/gamification')
@Controller('admin/gamification')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminGamificationController {
  constructor(private readonly gamificationService: GamificationManagementService) {}

  // ═══════════════════════════════════════════════════════════
  // OVERVIEW
  // ═══════════════════════════════════════════════════════════

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan gamification' })
  async getOverview() {
    return this.gamificationService.getGamificationOverview();
  }

  // ═══════════════════════════════════════════════════════════
  // DAILY TASKS
  // ═══════════════════════════════════════════════════════════

  @Get('daily-tasks')
  @ApiOperation({ summary: 'Danh sách nhiệm vụ hằng ngày' })
  async getDailyTasks(@Query() query: QueryDailyTaskDto) {
    return this.gamificationService.getDailyTasks(
      query.search,
      query.isActive,
      query.taskType,
      query.page || 1,
      query.limit || 50,
    );
  }

  @Get('daily-tasks/stats')
  @ApiOperation({ summary: 'Thống kê nhiệm vụ hằng ngày' })
  async getDailyTaskStats() {
    return this.gamificationService.getDailyTaskStats();
  }

  @Get('daily-tasks/:id')
  @ApiOperation({ summary: 'Chi tiết nhiệm vụ' })
  async getDailyTask(@Param('id') id: string) {
    return this.gamificationService.getDailyTaskById(id);
  }

  @Post('daily-tasks')
  @ApiOperation({ summary: 'Tạo nhiệm vụ hằng ngày mới' })
  async createDailyTask(@Body() dto: CreateDailyTaskDto) {
    return this.gamificationService.createDailyTask(dto);
  }

  @Patch('daily-tasks/:id')
  @ApiOperation({ summary: 'Cập nhật nhiệm vụ' })
  async updateDailyTask(@Param('id') id: string, @Body() dto: UpdateDailyTaskDto) {
    return this.gamificationService.updateDailyTask(id, dto);
  }

  @Delete('daily-tasks/:id')
  @ApiOperation({ summary: 'Xóa nhiệm vụ' })
  async deleteDailyTask(@Param('id') id: string) {
    return this.gamificationService.deleteDailyTask(id);
  }

  @Post('daily-tasks/:id/toggle')
  @ApiOperation({ summary: 'Bật/tắt nhiệm vụ' })
  async toggleDailyTask(@Param('id') id: string) {
    return this.gamificationService.toggleDailyTask(id);
  }

  @Post('daily-tasks/reorder')
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự nhiệm vụ' })
  async reorderDailyTasks(@Body() body: { taskIds: string[] }) {
    return this.gamificationService.reorderDailyTasks(body.taskIds);
  }

  // ═══════════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════

  @Get('achievements')
  @ApiOperation({ summary: 'Danh sách thành tích' })
  async getAchievements(@Query() query: QueryAchievementDto) {
    return this.gamificationService.getAchievements(
      query.search,
      query.isActive,
      query.category,
      query.conditionType,
      query.page || 1,
      query.limit || 50,
    );
  }

  @Get('achievements/stats')
  @ApiOperation({ summary: 'Thống kê thành tích' })
  async getAchievementStats() {
    return this.gamificationService.getAchievementStats();
  }

  @Get('achievements/:id')
  @ApiOperation({ summary: 'Chi tiết thành tích' })
  async getAchievement(@Param('id') id: string) {
    return this.gamificationService.getAchievementById(id);
  }

  @Post('achievements')
  @ApiOperation({ summary: 'Tạo thành tích mới' })
  async createAchievement(@Body() dto: CreateAchievementDto) {
    return this.gamificationService.createAchievement(dto);
  }

  @Patch('achievements/:id')
  @ApiOperation({ summary: 'Cập nhật thành tích' })
  async updateAchievement(@Param('id') id: string, @Body() dto: UpdateAchievementDto) {
    return this.gamificationService.updateAchievement(id, dto);
  }

  @Delete('achievements/:id')
  @ApiOperation({ summary: 'Xóa thành tích' })
  async deleteAchievement(@Param('id') id: string) {
    return this.gamificationService.deleteAchievement(id);
  }

  @Post('achievements/:id/toggle')
  @ApiOperation({ summary: 'Bật/tắt thành tích' })
  async toggleAchievement(@Param('id') id: string) {
    return this.gamificationService.toggleAchievement(id);
  }

  // ═══════════════════════════════════════════════════════════
  // CHECK-IN REWARDS
  // ═══════════════════════════════════════════════════════════

  @Get('check-in-rewards')
  @ApiOperation({ summary: 'Cấu hình phần thưởng điểm danh' })
  async getCheckInRewards() {
    return this.gamificationService.getCheckInRewards();
  }

  @Get('check-in-rewards/stats')
  @ApiOperation({ summary: 'Thống kê điểm danh' })
  async getCheckInStats() {
    return this.gamificationService.getCheckInStats();
  }

  @Patch('check-in-rewards')
  @ApiOperation({ summary: 'Cập nhật phần thưởng 1 ngày' })
  async updateCheckInReward(@Body() dto: UpdateCheckInRewardDto) {
    return this.gamificationService.updateCheckInReward(dto);
  }

  @Post('check-in-rewards/bulk')
  @ApiOperation({ summary: 'Cập nhật hàng loạt phần thưởng điểm danh' })
  async bulkUpdateCheckInRewards(@Body() dto: BulkUpdateCheckInRewardsDto) {
    return this.gamificationService.bulkUpdateCheckInRewards(dto.rewards);
  }
}
