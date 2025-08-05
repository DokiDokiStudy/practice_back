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
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { PostGetResponseDto } from './type/post-response.dto';
import { GetPostsFilterDto } from './dto/get-post-filter.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorator';
import { PostDetailResponseDto } from './type/post-detail-response.dto';

@ApiTags('게시물 API')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: '모든 게시물 조회' })
  @ApiExtraModels(PostGetResponseDto) // DTO 명시적 등록
  @ApiSuccessResponse('게시글 조회 성공', PostGetResponseDto)
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
  @ApiSuccessResponse('게시물이 생성되었습니다.')
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
  @ApiSuccessResponse(
    '게시물 단일 조회에 성공하였습니다.',
    PostDetailResponseDto,
  )
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
  @ApiSuccessResponse('게시물이 수정되었습니다.')
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
  @ApiSuccessResponse('게시물이 삭제되었습니다.')
  delete(@Request() request: AuthRequest, @Param('id') id: string) {
    return this.postService.delete(request, +id);
  }
}
