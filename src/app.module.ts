import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './config/config.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [configModule,PrismaModule,AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
