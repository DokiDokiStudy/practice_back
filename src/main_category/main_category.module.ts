import { Module } from '@nestjs/common';
import { MainCategoryService } from './main_category.service';
import { MainCategoryController } from './main_category.controller';

@Module({
  controllers: [MainCategoryController],
  providers: [MainCategoryService],
})
export class MainCategoryModule {}
