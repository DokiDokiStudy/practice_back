import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorator';
import {
  CategoryCreateResponseDto,
  CategoryGetAllResponseDto,
} from './type/category-response.dto';

@ApiTags('카테고리 API')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '카테고리 생성 - 백엔드 전용',
    description: '새로운 카테고리를 생성합니다.',
  })
  @Post()
  @HttpCode(200)
  @ApiExtraModels(CategoryCreateResponseDto) // DTO 명시적 등록
  @ApiSuccessResponse(
    '카테고리 생성에 성공하였습니다.',
    CategoryCreateResponseDto,
  )
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '카테고리 조회' })
  @ApiExtraModels(CategoryGetAllResponseDto) // DTO 명시적 등록
  @Get()
  @ApiSuccessResponse(
    '카테고리 조회 성공하였습니다.',
    CategoryGetAllResponseDto,
  )
  @ApiOperation({
    summary: '모든 카테고리 조회',
    description: '카테고리를 조회합니다.',
  })
  findAll() {
    return this.categoryService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   // @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return this.categoryService.update(+id /* , updateCategoryDto */);
  // }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '카테고리 삭제 - 백엔드 전용' })
  @Delete(':id')
  @ApiOperation({
    summary: '카테고리 삭제',
    description: '카테고리를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '카테고리 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '카테고리 삭제에 성공하였습니다.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '카테고리가 삭제되었습니다.' },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
