import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Likes } from './entities/likes.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { ReactionType } from './type/reactionType';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Likes)
    private readonly likesRepository: Repository<Likes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async commentLike(
    userId: number,
    commentId: number,
    reactionType: ReactionType,
  ) {
    const existing = await this.likesRepository.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (existing) {
      if (existing.reactionType === reactionType) {
        await this.likesRepository.remove(existing);
        return { message: `${reactionType} 취소됨` };
      } else {
        existing.reactionType = reactionType;
        await this.likesRepository.save(existing);
        return { message: `${reactionType}로 변경됨` };
      }
    }

    const commentExists = await this.commentRepository.exist({
      where: { id: commentId },
    });
    if (!commentExists) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    const newLike = this.likesRepository.create({
      user: { id: userId },
      comment: { id: commentId },
      reactionType,
    });

    await this.likesRepository.save(newLike);
    return { message: `${reactionType} 등록`, data: { id: newLike.id } };
  }

  async postLike(userId: number, postId: number, reactionType: ReactionType) {
    const existing = await this.likesRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existing) {
      if (existing.reactionType === reactionType) {
        await this.likesRepository.remove(existing);
        return { message: `${reactionType} 취소됨` };
      } else {
        existing.reactionType = reactionType;
        await this.likesRepository.save(existing);
        return { message: `${reactionType}로 변경됨` };
      }
    }

    const postExists = await this.postRepository.exist({
      where: { id: postId },
    });
    if (!postExists) {
      throw new BadRequestException('존재하지 않는 게시물입니다.');
    }

    const newLike = this.likesRepository.create({
      user: { id: userId },
      post: { id: postId },
      reactionType,
    });

    await this.likesRepository.save(newLike);
    return { message: `${reactionType} 등록`, data: { id: newLike.id } };
  }
}
