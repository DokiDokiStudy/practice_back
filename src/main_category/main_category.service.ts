import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMainCategoryDto } from './dto/create-main_category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MainCategory } from './entities/main_category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MainCategoryService {
  constructor(
    @InjectRepository(MainCategory)
    private readonly mainCategoryRepository: Repository<MainCategory>,
  ) {}

  async create(createMainCategoryDto: CreateMainCategoryDto) {
    const { name } = createMainCategoryDto;

    const newMainCategory = await this.mainCategoryRepository.save({
      name,
    });

    return {
      statusCode: 201,
      message: '메인 카테고리가 생성되었습니다.',
      mainCategoryId: newMainCategory.id,
    };
  }

  async get() {
    const mainCategories = await this.mainCategoryRepository.find();

    return {
      statusCode: 200,
      mainCategories,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} mainCategory`;
  }

  async delete(id: number) {
    const mainCategory = await this.mainCategoryRepository.findOneBy({
      id,
    });

    if (!mainCategory)
      throw new NotFoundException('존재하지 않는 메인 카테고리입니다.');

    await this.mainCategoryRepository.delete({ id });

    return {
      statusCode: 200,
      message: '메인 카테고리가 삭제되었습니다.',
    };
  }
}
