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
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentCreateResponseDto } from './type/comment-response.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 생성',
  })
  @ApiOkResponse({
    description: '댓글 생성 성공',
    type: CommentCreateResponseDto,
  })
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

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 단일 조회(ID)',
  })
  @Get(':commentId')
  async findOne(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req: AuthRequest,
  ) {
    return this.commentService.findOne(commentId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 수정',
  })
  @Patch(':commentId')
  update(
    @Request() request: AuthRequest,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(request, +commentId, updateCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 삭제',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글이 삭제되었습니다.' },
      },
    },
  })
  @Delete(':commentId')
  remove(
    @Request() request: AuthRequest,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.remove(request, +commentId);
  }
}
