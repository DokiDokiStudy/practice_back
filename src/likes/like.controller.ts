import {
  Controller,
  Post,
  UseGuards,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AuthRequest } from 'src/auth/type/jwt';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':commentId')
  async commentLike(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req: AuthRequest,
  ) {
    return await this.likeService.commentLike(commentId, req.user.id);
  }
}
