import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@ApiTags('카테고리 API')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post()
  @ApiOperation({
    summary: '카테고리 생성',
    description: '새로운 카테고리를 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 생성에 성공하였습니다.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'docker' },
      },
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get()
  @ApiOperation({
    summary: '모든 카테고리 조회',
    description: '카테고리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 조회 성공',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'docker' },
              children: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 2 },
                    name: { type: 'string', example: '1장' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @UseGuards(JwtAuthGuard)
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
