import { Module } from '@nestjs/common';
import { MainCategoryService } from './main_category.service';
import { MainCategoryController } from './main_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainCategory } from './entities/main_category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MainCategory])],
  controllers: [MainCategoryController],
  providers: [MainCategoryService],
})
export class MainCategoryModule {}
