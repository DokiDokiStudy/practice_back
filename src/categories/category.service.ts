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

  // 쿼리 코드
  // const categories = (await this.categoryRepository.query(`
  //   WITH RECURSIVE category_path (id, name, parentId, depth) AS (
  //     -- 1단계: 최상위 카테고리 선택 (부모가 없는 것)
  //     SELECT id, name, parentId, 1
  //     FROM category
  //     WHERE
  //       parentId IS NULL AND
  //       deletedAt IS NOT NULL

  //     UNION ALL

  //     -- 2단계 이후: 자식들을 부모 기준으로 찾아서 depth를 1씩 증가
  //     SELECT c.id, c.name, c.parentId, cp.depth + 1
  //     FROM category c
  //     JOIN category_path cp ON c.parentId = cp.id
  //   )
  //   SELECT * FROM category_path;
  // `)) as Category[];
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
        message: '카테고리 조회에 성공했습니다.',
        statusCode: 200,
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
