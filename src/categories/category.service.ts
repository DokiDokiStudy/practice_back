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
        statusCode: 200,
        name: category.name,
      };
    } catch (error) {
      console.error(error);
      return {
        message: '카테고리 생성에 실패했습니다.',
        statusCode: 500,
      };
    }
  }

  async findAll() {
    try {
      const categories = (await this.categoryRepository.query(`
        WITH RECURSIVE category_path (id, name, parentId, depth) AS (
          -- 1단계: 최상위 카테고리 선택 (부모가 없는 것)
          SELECT id, name, parentId, 1
          FROM category
          WHERE 
            parentId IS NULL AND 
            deletedAt IS NOT NULL

          UNION ALL

          -- 2단계 이후: 자식들을 부모 기준으로 찾아서 depth를 1씩 증가
          SELECT c.id, c.name, c.parentId, cp.depth + 1
          FROM category c
          JOIN category_path cp ON c.parentId = cp.id
        )
        SELECT * FROM category_path;
      `)) as Category[];

      return {
        message: '카테고리 조회에 성공했습니다.',
        statusCode: 200,
        categories,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: '카테고리 조회에 실패했습니다.',
      };
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} category`;
  // }

  // update(id: number /* updateCategoryDto: UpdateCategoryDto */) {
  //   return `This action updates a #${id} category`;
  // }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) throw new NotFoundException('존재하지 않는 카테고리입니다.');

    await this.categoryRepository.softDelete({ id });

    return {
      statusCode: 200,
      message: '게시물이 삭제되었습니다.',
    };
  }
}
