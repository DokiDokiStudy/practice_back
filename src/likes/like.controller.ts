import {
  Controller,
  Post,
  UseGuards,
  Param,
  Request,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AuthRequest } from 'src/auth/type/jwt';
import { commentLikeDto } from './dto/comment-like.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':commentId')
  async commentLike(
    @Request() req: AuthRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: commentLikeDto,
  ) {
    return await this.likeService.commentLike(
      req.user.id,
      commentId,
      body.reactionType,
    );
  }
}
