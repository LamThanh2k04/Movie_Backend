import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MovieService } from './movie.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { Role } from '@prisma/client';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorators';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateMovieDto } from './dto/createMovie.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { successResponse } from 'src/common/helper/response.helper';
import { UpdateMovieDto } from './dto/updateMovie.dto';
import { GetAllMoviesDto } from './dto/getAllMovies.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }


  @Post('createMovie')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'trailer', maxCount: 1
    },
    {
      name: 'thumbnail', maxCount: 1
    },
    {
      name: 'banner', maxCount: 1
    }
  ]))
  async createMovie(@Body() createMovieDto: CreateMovieDto, @UploadedFiles() files: {
    trailer: UploadedFileType[];
    thumbnail: UploadedFileType[];
    banner?: UploadedFileType[];
  }) {
    console.log(createMovieDto)
    const data = await this.movieService.createMovie(createMovieDto, files.trailer?.[0], files.thumbnail?.[0], files.banner?.[0])
    return successResponse(data, 'Tạo phim thành công', 201)
  }

  @Put('updateMovie/:movieId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'trailer', maxCount: 1
    },
    {
      name: 'thumbnail', maxCount: 1
    },
    {
      name: 'banner', maxCount: 1
    }
  ]))
  async updateMovie(@Param('movieId', ParseIntPipe) movieId: number,@Body() updateMovieDto: UpdateMovieDto, @UploadedFiles() files: {
    trailer?: UploadedFileType[];
    thumbnail?: UploadedFileType[];
    banner?: UploadedFileType[];
  }) {
    const data = await this.movieService.updateMovie(movieId, updateMovieDto, files.trailer?.[0], files.thumbnail?.[0], files.banner?.[0])
    return successResponse(data, 'Cập nhật phim thành công', 200)
  }

  @Put('updateMovieStatus/:movieId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateMovieStatus(@Param('movieId', ParseIntPipe) movieId: number) {
    await this.movieService.updateMovieStatus(movieId)
    return successResponse(null, 'Cập nhật trạng thái phim thành công', 200)
  }

  @Get('getAllMovies')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllMovies(@Query() getAllMoviesDto: GetAllMoviesDto) {
    const data = await this.movieService.getAllMovies(getAllMoviesDto)
    return successResponse(data, 'Lấy danh sách phim thành công', 200)
  }
}
