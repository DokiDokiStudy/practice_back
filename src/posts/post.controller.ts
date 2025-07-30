import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthRequest } from 'src/auth/type/jwt';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { PostGetResponseDto } from './type/post-response.dto';
import { GetPostsFilterDto } from './dto/get-post-filter.dto';

@ApiTags('게시물 API')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: '모든 게시물 조회' })
  @ApiOkResponse({
    description: '게시글 조회 성공',
    type: PostGetResponseDto,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: '게시판 종류',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지 당 게시글 수',
  })
  @Get()
  get(@Query() filterDto: GetPostsFilterDto) {
    return this.postService.get(filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: '게시물 생성',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '게시물이 생성되었습니다.' },
      },
    },
  })
  @Post()
  create(@Request() reqest: AuthRequest, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(reqest, createPostDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '단일 게시물 조회',
  })
  @ApiParam({
    name: 'id',
    description: '게시물 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: '게시물 제목' },
        author: { type: 'string', example: '작성자' },
        content: { type: 'string', example: '게시물 내용' },
        likes: { type: 'array', example: [{}] },
        likeCounts: { type: 'number', example: 1 },
        commentsCount: { type: 'number', example: 1 },
        comments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              content: { type: 'string', example: '댓글 내용' },
              childrenCount: { type: 'number', example: 1 },
              children: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 2 },
                    content: { type: 'string', example: '대댓글 내용' },
                    childrenCount: { type: 'number', example: 0 },
                    children: { type: 'array' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch(':id')
  @ApiOperation({
    summary: '게시물 수정',
  })
  @ApiParam({
    name: 'id',
    description: '게시물 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '게시물이 수정되었습니다.' },
      },
    },
  })
  update(
    @Request() request: AuthRequest,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(request, +id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete(':id')
  @ApiOperation({
    summary: '게시물 삭제',
  })
  @ApiParam({
    name: 'id',
    description: '게시물 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '게시물이 삭제되었습니다.' },
      },
    },
  })
  delete(@Request() request: AuthRequest, @Param('id') id: string) {
    return this.postService.delete(request, +id);
  }
}
