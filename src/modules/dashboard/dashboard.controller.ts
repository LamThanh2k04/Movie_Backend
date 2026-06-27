import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { successResponse } from 'src/common/helper/response.helper';
import { Roles } from '../auth/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { FavoriteChartDto } from './dto/favoriteChart.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('GetOverView')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllOverView() {
    const data = await this.dashboardService.getAllOverView()
    return successResponse(data, 'Lấy tổng quan hệ thống thành công', 200)
  }

  @Get('getMovieFavoriteUser')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getMovieFavoriteUser() {
    const data = await this.dashboardService.getMovieFavoriteUserChart()
    return successResponse(data, 'Lấy top 5 phim được yêu thích nhiều nhất thành công', 200)
  }

  @Get('getFavoriteChart')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getFavoriteChart(@Query() favoriteChartDto: FavoriteChartDto) {
    const data = await this.dashboardService.getFavoriteChart(favoriteChartDto)
    return successResponse(data, 'Lấy thống kê lượt thích theo năm thành công', 200)
  }
}
