import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './config/config.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GenreModule } from './modules/genre/genre.module';
import { CountryModule } from './modules/country/country.module';
@Module({
  imports: [configModule,PrismaModule,AuthModule,UserModule,GenreModule,CountryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
