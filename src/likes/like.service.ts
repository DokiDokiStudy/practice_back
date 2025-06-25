import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async commentLike(commentId: number, userId: number) {
    console.log('userId:', userId);
    console.log('commentId:', commentId);
    if (!userId || !commentId) {
      throw new BadRequestException('유효하지 않은 요청입니다.');
    }

    const alreadyLiked = await this.likeRepository.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (alreadyLiked) {
      throw new BadRequestException('이미 좋아요를 누른 댓글입니다.');
    }

    const like = this.likeRepository.create({
      user: { id: userId },
      comment: { id: commentId },
      reactionType: 'like',
    });
    await this.likeRepository.save(like);

    return { message: 'success' };
  }
}
