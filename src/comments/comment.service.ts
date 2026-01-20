import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthRequest } from 'src/auth/type/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { Likes } from 'src/likes/entities/likes.entity';
import { instanceToPlain } from 'class-transformer';
import { createApiResponse } from 'src/common/create-api-response';
import { CommentGetResponseDto } from './type/comment-response.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Likes)
    private readonly likeRepository: Repository<Likes>,
  ) {}

  async create(request: AuthRequest, createCommentDto: CreateCommentDto) {
    try {
      const { id, nickName } = request.user;
      const { postId, content, commentId } = createCommentDto;
      const post = await this.postRepository.findOneBy({
        id: postId,
      });

      if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

      let comment: Comment | null = null;
      if (commentId) {
        comment = await this.commentRepository.findOneBy({
          id: commentId,
        });
      }

      await this.commentRepository.save({
        user: { id },
        post,
        postId: post.id,
        parent: comment ?? undefined,
        author: nickName,
        content,
      });

      return createApiResponse(200, '댓글이 등록되었습니다.');
    } catch (error) {
      console.error('Comment creation error:', error);

      // Preserve specific errors
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('댓글 등록에 실패했습니다.');
    }
  }

  findAll() {
    return `This action returns all comment`;
  }

  async findOne(commentId: number, currentUserId?: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }

    const likeCount = await this.likeRepository.count({
      where: { comment: { id: commentId } },
    });

    const writerIsMe = currentUserId
      ? await this.likeRepository.exist({
          where: {
            comment: { id: commentId },
            user: { id: currentUserId },
          },
        })
      : false;

    return createApiResponse(
      200,
      '댓글 단일 조회에 성공하였습니다.',
      {
        comment: instanceToPlain(comment),
        likeCount,
        writerIsMe,
      },
      CommentGetResponseDto,
    );
  }

  async update(
    request: AuthRequest,
    id: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id },
        relations: ['user'], // relations을 지정해줘야만 userId 가져옴
      });

      const user = await this.userRepository.findOneBy({
        id: request.user.id,
      });

      if (!comment) throw new NotFoundException('존재하지 않는 댓글입니다.');

      if (user?.id !== comment.user.id)
        throw new UnauthorizedException('댓글 작성자만 수정할 수 있습니다.');

      const updatedComment = Object.assign(comment, updateCommentDto);
      await this.commentRepository.save(updatedComment);

      return createApiResponse(200, '댓글이 수정되었습니다.');
    } catch (error) {
      console.error('Comment update error:', error);

      // Preserve specific errors
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('댓글 수정에 실패했습니다.');
    }
  }

  async remove(request: AuthRequest, id: number) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      const user = await this.userRepository.findOneBy({
        id: request.user.id,
      });

      if (!comment) throw new NotFoundException('이미 삭제된 댓글입니다.');

      if (user?.id !== comment.user.id)
        throw new UnauthorizedException('댓글 작성자만 삭제할 수 있습니다.');

      await this.commentRepository.softDelete({ id });

      return createApiResponse(200, '댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('Comment deletion error:', error);

      // Preserve specific errors
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('댓글 삭제에 실패했습니다.');
    }
  }
}
