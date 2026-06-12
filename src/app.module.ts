import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './config/config.module';
import { PrismaModule } from './common/prisma/prisma.module';
@Module({
  imports: [configModule,PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
