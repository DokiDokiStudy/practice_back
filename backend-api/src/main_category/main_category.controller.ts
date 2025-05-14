import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MainCategoryService } from './main_category.service';
import { CreateMainCategoryDto } from './dto/create-main_category.dto';
import { UpdateMainCategoryDto } from './dto/update-main_category.dto';

@Controller('main-category')
export class MainCategoryController {
  constructor(private readonly mainCategoryService: MainCategoryService) {}

  @Post()
  create(@Body() createMainCategoryDto: CreateMainCategoryDto) {
    return this.mainCategoryService.create(createMainCategoryDto);
  }

  @Get()
  findAll() {
    return this.mainCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mainCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMainCategoryDto: UpdateMainCategoryDto) {
    return this.mainCategoryService.update(+id, updateMainCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mainCategoryService.remove(+id);
  }
}
