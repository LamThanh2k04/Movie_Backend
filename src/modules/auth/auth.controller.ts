import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterDto } from './dto/register.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { successResponse } from 'src/common/helper/response.helper';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(@Body() registerDto: RegisterDto, @UploadedFile() file: UploadedFileType) {
    const data = await this.authService.register(registerDto, file)
    return successResponse(data, 'Đăng kí thành công', 201)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto)
    return successResponse(data, 'Đăng nhập thành công', 200)
  }
}
