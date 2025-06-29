import {
  Controller,
  Post,
  UseGuards,
  Param,
  Request,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AuthRequest } from 'src/auth/type/jwt';
import { commentLikeDto } from './dto/comment-like.dto';

@Controller('like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':commentId')
  async commentLike(
    @Request() req: AuthRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: commentLikeDto,
  ) {
    return await this.likesService.commentLike(
      req.user.id,
      commentId,
      body.reactionType,
    );
  }
}
