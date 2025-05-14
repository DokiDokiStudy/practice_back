import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MainCategory } from 'src/main_category/entities/main_category.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [MainCategory, Category],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
