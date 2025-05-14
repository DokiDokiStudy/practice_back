import { Injectable } from '@nestjs/common';
import { CreateMainCategoryDto } from './dto/create-main_category.dto';
import { UpdateMainCategoryDto } from './dto/update-main_category.dto';

@Injectable()
export class MainCategoryService {
  create(createMainCategoryDto: CreateMainCategoryDto) {
    return 'This action adds a new mainCategory';
  }

  findAll() {
    return `This action returns all mainCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mainCategory`;
  }

  update(id: number, updateMainCategoryDto: UpdateMainCategoryDto) {
    return `This action updates a #${id} mainCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} mainCategory`;
  }
}
