import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      // 상위카테고리 검증
      let parentCategory: Category | null = null;
      if (createCategoryDto.parentId) {
        const parentCategoryRepo = await this.categoryRepository.findOneBy({
          id: createCategoryDto.parentId,
        });

        if (!parentCategoryRepo)
          throw new BadRequestException('존재하지않는 상위 카테고리입니다.');

        parentCategory = parentCategoryRepo;
      }

      const category = await this.categoryRepository.save({
        name: createCategoryDto.name,
        parent: parentCategory ?? undefined,
      });

      return {
        message: '카테고리 생성에 성공하였습니다.',
        name: category.name,
      };
    } catch (error) {
      console.error(error);
      return {
        message: '카테고리 생성에 실패했습니다.',
      };
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        relations: ['parent', 'children', 'children.children'],
      });
      const parentCategories = categories.filter((c) => !c.parent);

      const childrenCategories = (category: Category): any => ({
        id: category.id,
        name: category.name,
        children: category.children?.map(childrenCategories) || [],
      });

      return {
        categories: parentCategories.map(childrenCategories),
      };
    } catch (error) {
      console.error(error);
      return {
        message: '카테고리 조회에 실패했습니다.',
      };
    }
  }

  //TODOS: 하위 카테고리가 남아있을경우? 다 삭제?
  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) throw new NotFoundException('존재하지 않는 카테고리입니다.');

    await this.categoryRepository.softDelete({ id });

    return {
      message: '카테고리가 삭제되었습니다.',
    };
  }
}
