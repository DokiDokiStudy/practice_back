import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/type/jwt';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() request: AuthRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(request, createCommentDto);
  }

  // 댓글 전체 조회가 어디 쓰이지
  // @Get()
  // findAll() {
  //   return this.commentService.findAll();
  // }

  @Get(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req: AuthRequest,
  ) {
    return this.commentService.findOne(commentId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() request: AuthRequest,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(request, +id, updateCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() request: AuthRequest, @Param('id') id: string) {
    return this.commentService.remove(request, +id);
  }
}
