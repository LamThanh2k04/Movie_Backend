import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filter/allException.filters';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ thuộc tính hk có trong dto
      forbidNonWhitelisted: true, // Nếu có thuộc tính hk có trong dto sẽ trả về lỗi
      transform: true // Tự động chuyển đổi kiểu dữ liệu theo dto (ví dụ: string -> number)
    })
  )
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server được chạy trên http://localhost:${process.env.PORT ?? 3000}`)
}
bootstrap();
