import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { CategoryService } from 'src/categories/category.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryService = app.get(CategoryService);

  // 초기 데이터 삽입
  await categoryService.create({
    name: '공지사항',
  });

  await app.close();
}

bootstrap();
