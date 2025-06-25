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

  async commentLike(userId: number, commentId: number) {
    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      return { message: '좋아요 취소됨' };
    }

    const commentExists = await this.commentRepository.exist({
      where: { id: commentId },
    });
    if (!commentExists) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    if (!userId || !commentId) {
      throw new BadRequestException('유효하지 않은 요청입니다.');
    }

    const newLike = this.likeRepository.create({
      user: { id: userId },
      comment: { id: commentId },
      reactionType: 'like',
    });

    await this.likeRepository.save(newLike);
    return { message: '좋아요 등록됨', data: newLike.id };
  }
}
