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
    @Request() reqest: AuthRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(reqest, createCommentDto);
  }

  // @Get()
  // findAll() {
  //   return this.commentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentService.findOne(+id);
  // }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() reqest: AuthRequest,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(reqest, +id, updateCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() reqest: AuthRequest, @Param('id') id: string) {
    return this.commentService.remove(reqest, +id);
  }
}
