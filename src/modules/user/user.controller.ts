import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/createUser.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { successResponse } from 'src/common/helper/response.helper';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetAllUsersDto } from './dto/getAllUsers.dto';
import { AddFavoriteMovieDto } from './dto/addFavoriteMovie.dto';
import { RemoveFavoriteMovieDto } from './dto/removeFavoriteMovie.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Post('createUser')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(@Body() createUserDto: CreateUserDto, @UploadedFile() avatar: UploadedFileType) {
    const data = await this.userService.createUser(createUserDto, avatar)
    return successResponse(data, 'Tạo người dùng thành công', 201)
  }

  @Put('updateUser/:userId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(@Param('userId', ParseIntPipe) userId: number, @Body() updateUserDto: UpdateUserDto, @UploadedFile() avatar: UploadedFileType) {
    const data = await this.userService.updateUser(userId, updateUserDto, avatar)
    return successResponse(data, 'Cập nhập người dùng thành công', 200)
  }

  @Get('getAllUsers')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllUsers(@Query() getAllUsersDto: GetAllUsersDto) {
    const data = await this.userService.getAllUsers(getAllUsersDto)
    return successResponse(data, 'Lấy danh sách người dùng thành công', 200)
  }

  @Put('updateUserStatus/:userId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateUserStatus(@Param('userId', ParseIntPipe) userId: number) {
    await this.userService.updateUserStatus(userId)
    return successResponse(null, 'Cập nhật trạng thái thành công', 200)
  }

  @Post('addFavoriteMovie')
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addFavoriteMovie(@Req() req, addFavoriteMovieDto: AddFavoriteMovieDto) {
    await this.userService.addFavoriteMovie(req.user.id, addFavoriteMovieDto)
    return successResponse(null, 'Thêm yêu thích phim thành công', 200)
  }


  @Post('removeFavoriteMovie')
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async removeFavoriteMovie(@Req() req, removeFavoriteDto: RemoveFavoriteMovieDto) {
    await this.userService.removeFavoriteMovie(req.user.id, removeFavoriteDto)
    return successResponse(null, 'Xóa yêu thích phim thành công', 200)
  }

  
  @Get('getFavoriteMovieUser')
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getFavoriteMovieUser(@Req() req) {
    const data = await this.userService.getFavoriteMovieUser(req.user.id)
    return successResponse(data, 'Lấy danh sách yêu thích phim thành công', 200)
  }


}
