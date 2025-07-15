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
import { CommonLikeDto } from './dto/common-like.dto';

@Controller('like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('comment/:commentId')
  async commentLike(
    @Request() req: AuthRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: CommonLikeDto,
  ) {
    return await this.likesService.commentLike(
      req.user.id,
      commentId,
      body.reactionType,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/:postId')
  async postLike(
    @Request() req: AuthRequest,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CommonLikeDto,
  ) {
    return await this.likesService.postLike(
      req.user.id,
      postId,
      body.reactionType,
    );
  }
}
