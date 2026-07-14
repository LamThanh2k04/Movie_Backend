import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Roles } from '../auth/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { successResponse } from 'src/common/helper/response.helper';
import { UpdateGenreDto } from './dto/updateGenre.dto';
import { GetAllGenresDto } from './dto/getAllGenres.dto';
import { CreateGenreDto } from './dto/createGenre.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) { }

  @Post('createGenre')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async createGenre(@Body() createGenerDto: CreateGenreDto) {
    const data = await this.genreService.createGenre(createGenerDto)
    return successResponse(data, 'Tạo thể loại thành công', 201)
  }

  @Put('updateGenre/:genreId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateGenre(@Param('genreId', ParseIntPipe) genreId: number,@Body() updateGenerDto: UpdateGenreDto) {
    const data = await this.genreService.updateGenre(genreId, updateGenerDto)
    return successResponse(data, 'Cập nhật thể loại thành công', 200)
  }

  @Put('updateGenreStatus/:genreId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateGenreStatus(@Param('genreId', ParseIntPipe) genreId: number) {
    await this.genreService.updateGenreStatus(genreId)
    return successResponse(null, 'Cập nhật trạng thái thể loại thành công', 200)
  }

  @Get('getAllGenres')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllGenres(@Query() getAllGenresDto : GetAllGenresDto) {
    const data = await this.genreService.getAllGenres(getAllGenresDto)
     return successResponse(data, 'Lấy danh sách thể loại thành công', 200)
  }

  @Get('getAllGenresSimple')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
   async getAllGenresSimple() {
      const data = await this.genreService.getAllGenresSimple() 
      return successResponse(data,'Lấy danh sách thể loại thành công',200)
   }
}
