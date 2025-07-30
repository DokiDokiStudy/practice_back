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
  HttpCode,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthRequest } from 'src/auth/type/jwt';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorator';
import { CommentGetResponseDto } from './type/comment-response.dto';
@ApiTags('댓글 API')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '댓글 생성',
  })
  @Post()
  @HttpCode(200)
  @ApiSuccessResponse('댓글 생성에 성공하였습니다.')
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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '댓글 단일 조회(ID)',
  })
  @ApiExtraModels(CommentGetResponseDto)
  @ApiSuccessResponse('댓글 조회에 성공하였습니다.', CommentGetResponseDto)
  @Get(':commentId')
  async findOne(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req: AuthRequest,
  ) {
    return this.commentService.findOne(commentId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '댓글 수정',
  })
  @Patch(':commentId')
  @HttpCode(200)
  @ApiSuccessResponse('댓글 수정에 성공하였습니다.')
  update(
    @Request() request: AuthRequest,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(request, +commentId, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '댓글 삭제',
  })
  @ApiSuccessResponse('댓글 삭제에 성공하였습니다.')
  @Delete(':commentId')
  remove(
    @Request() request: AuthRequest,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.remove(request, +commentId);
  }
}
