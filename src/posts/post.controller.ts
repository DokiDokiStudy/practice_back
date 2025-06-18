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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthRequest } from 'src/auth/type/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@ApiTags('게시물 API')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '모든 게시물 조회' })
  get() {
    return this.postService.get();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '게시물 생성' })
  create(@Request() reqest: AuthRequest, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(reqest, createPostDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '단일 게시물 조회' })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() request: AuthRequest,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(request, +id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: '게시물 삭제' })
  delete(@Request() request: AuthRequest, @Param('id') id: string) {
    return this.postService.delete(request, +id);
  }
}
