import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtConfig } from 'src/common/config/jwt.config';

@Module({
  imports: [
    PrismaModule,
     CloudinaryModule,
     JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfig
    })
    ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
