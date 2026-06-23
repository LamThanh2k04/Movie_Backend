import { Module } from '@nestjs/common';
import { ActorService } from './actor.service';
import { ActorController } from './actor.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports : [PrismaModule,CloudinaryModule],
  controllers: [ActorController],
  providers: [ActorService],
})
export class ActorModule {}
