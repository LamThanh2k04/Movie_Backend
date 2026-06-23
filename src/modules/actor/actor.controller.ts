import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ActorService } from './actor.service';
import { CreateActorDto } from './dto/createActor.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { Roles } from '../auth/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { successResponse } from 'src/common/helper/response.helper';
import { UpdateActorDto } from './dto/updateActor.dto';
import { GetAllActorsDto } from './dto/getAllActors.dto';

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) { }

  @Post('createActor')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async createActor(@Body() createActorDto: CreateActorDto, @UploadedFile() avatar: UploadedFileType) {
    const data = await this.actorService.createActor(createActorDto, avatar)
    return successResponse(data, 'Tạo diễn viên thành công', 201)
  }
  @Put('updateActor/:actorId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateActor(@Param('actorId', ParseIntPipe) actorId: number, @Body() updateActorDto: UpdateActorDto, @UploadedFile() avatar: UploadedFileType) {
    const data = await this.actorService.updateActor(actorId, updateActorDto, avatar)
    return successResponse(data, 'Cập nhật diễn viên thành công', 200)
  }

  @Put('updateActorStatus/:actorId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateActorStatus(@Param('actorId', ParseIntPipe) actorId: number) {
     await this.actorService.updateActorStatus(actorId)
     return successResponse(null, 'Cập nhật trạng thái diễn viên thành công', 200)
   }

  @Get('getAllActors')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllActors(@Query() getAllActorsDto: GetAllActorsDto) {
    const data = await this.actorService.getAllActors(getAllActorsDto)
    return successResponse(data,'Lấy danh sách diễn viên thành công',200)
   }
}
