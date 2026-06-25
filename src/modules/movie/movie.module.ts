import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports : [PrismaModule, CloudinaryModule],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
