import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CountryService } from './country.service';
import { Roles } from '../auth/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CreateCountryDto } from './dto/createCountry.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { successResponse } from 'src/common/helper/response.helper';
import { GetAllCountriesDto } from './dto/getAllCountries.dto';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) { }

  @Post('createCountry')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createCountry(@Body() createCountryDto: CreateCountryDto, @UploadedFile() image: UploadedFileType) {
    const data = await this.countryService.createCountry(createCountryDto, image)
    return successResponse(data, 'Tạo quốc gia thành công', 201)
  }

  @Put('updateCountry/:countryId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateCountry(@Param('countryId', ParseIntPipe) countryId: number, @Body() updateCountryDto: CreateCountryDto, @UploadedFile() image: UploadedFileType) {
    const data = await this.countryService.updateCountry(countryId, updateCountryDto, image)
    return successResponse(data, 'Cập nhật quốc gia thành công', 200)
  }

  @Put('updateCountryStatus/:countryId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateCountryStatus(@Param('countryId', ParseIntPipe) countryId: number) {
    await this.countryService.updateCountryStatus(countryId)
    return successResponse(null, 'Cập nhật trạng thái quốc gia thành công', 200)
  }

  @Get('getAllCountries')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllCountries(@Query() getAllCountriesDto: GetAllCountriesDto) {
    const data = await this.countryService.getAllCountries(getAllCountriesDto)
    return successResponse(data, 'Lấy danh sách quốc gia thành công', 200)
  }

  @Get('getAllCountriesSimple')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllCountriesSimple() {
    const data = await this.countryService.getAllCountriesSimple()
    return successResponse(data, 'Lấy danh sách quốc gia thành công', 200)
  }

}
