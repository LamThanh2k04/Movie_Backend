import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports : [PrismaModule,CloudinaryModule],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
