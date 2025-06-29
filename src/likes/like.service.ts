import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { ReactionType } from './type/reactionType';

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

  async commentLike(
    userId: number,
    commentId: number,
    reactionType: ReactionType,
  ) {
    const existing = await this.likeRepository.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (existing) {
      if (existing.reactionType === reactionType) {
        await this.likeRepository.remove(existing);
        return { message: `${reactionType} 취소됨` };
      } else {
        existing.reactionType = reactionType;
        await this.likeRepository.save(existing);
        return { message: `${reactionType}로 변경됨` };
      }
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
      reactionType,
    });

    await this.likeRepository.save(newLike);
    return { message: `${reactionType} 등록`, data: { id: newLike.id } };
  }
}
