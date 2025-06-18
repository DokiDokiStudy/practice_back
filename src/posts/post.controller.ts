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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthRequest } from 'src/auth/type/jwt';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@ApiTags('게시물 API')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '모든 게시물 조회' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              userId: { type: 'number', example: 14 },
              categoryId: { type: 'string', nullable: true, example: 2 },
              category: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 5 },
                      name: { type: 'string', example: '1.1장' },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-06-18T13:59:33.644Z',
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-06-18T13:59:33.644Z',
                      },
                      deletedAt: {
                        type: 'string',
                        nullable: true,
                        format: 'date-time',
                        example: null,
                      },
                      parent: {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              id: { type: 'number', example: 3 },
                              name: { type: 'string', example: '1장' },
                              createdAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2025-06-18T13:33:09.569Z',
                              },
                              updatedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2025-06-18T13:33:09.569Z',
                              },
                              deletedAt: {
                                type: 'string',
                                nullable: true,
                                example: null,
                              },
                              parent: {
                                oneOf: [
                                  {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'number', example: 2 },
                                      name: {
                                        type: 'string',
                                        example: 'docker',
                                      },
                                      createdAt: {
                                        type: 'string',
                                        example: '2025-06-18T13:32:33.358Z',
                                      },
                                      updatedAt: {
                                        type: 'string',
                                        example: '2025-06-18T13:32:33.358Z',
                                      },
                                      deletedAt: {
                                        type: 'string',
                                        nullable: true,
                                        example: null,
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              title: { type: 'string', example: '1번째 게시물' },
              author: { type: 'string', example: 'yang' },
              content: { type: 'string', example: '1번째 게시물입니다!!!' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-06-18T14:52:46.607Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-06-18T14:52:46.607Z',
              },
              deletedAt: {
                type: 'string',
                nullable: true,
                format: 'date-time',
                example: null,
              },
            },
          },
        },
      },
    },
  })
  get() {
    return this.postService.get();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post()
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
