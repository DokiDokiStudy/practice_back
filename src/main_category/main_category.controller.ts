import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MainCategoryService } from './main_category.service';
import { CreateMainCategoryDto } from './dto/create-main_category.dto';

@Controller('main-category')
export class MainCategoryController {
  constructor(private readonly mainCategoryService: MainCategoryService) {}

  @Post()
  create(@Body() createMainCategoryDto: CreateMainCategoryDto) {
    return this.mainCategoryService.create(createMainCategoryDto);
  }

  @Get()
  get() {
    return this.mainCategoryService.get();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mainCategoryService.findOne(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mainCategoryService.delete(+id);
  }
}
