import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { AuthRequest } from 'src/auth/type/jwt';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { GetPostsFilterDto } from './dto/get-post-filter.dto';
import { createApiResponse } from 'src/common/create-api-response';
import {
  PostGetResponseData,
  PostGetResponseDto,
} from './type/post-response.dto';
import { plainToInstance } from 'class-transformer';
import {
  CommentDetailDto,
  PostDetailResponseDto,
} from './type/post-detail-response.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async get(filterDto: GetPostsFilterDto) {
    const { categoryId, page = 1, limit = 10 } = filterDto;

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category');

    if (categoryId) {
      query.andWhere('categoryId = :categoryId', { categoryId });
    }

    query.orderBy('post.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [posts, total] = await query.getManyAndCount();

    const transformedPosts = posts.map((post) =>
      plainToInstance(PostGetResponseData, post, {
        excludeExtraneousValues: true, // Ensures only decorated properties are included
      }),
    );

    return createApiResponse(
      200,
      '게시글 조회에 성공하였습니다.',
      {
        posts: transformedPosts,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      PostGetResponseDto,
    );
  }

  async create(request: AuthRequest, createPostDto: CreatePostDto) {
    try {
      const { id, nickName } = request.user;
      const { categoryId, title, content } = createPostDto;
      const category = await this.categoryRepository.findOneBy({
        id: categoryId,
      });

      if (!category)
        throw new NotFoundException('존재하지 않는 카테고리입니다.');

      await this.postRepository.save({
        user: { id },
        author: nickName,
        category,
        title,
        content,
      });

      return createApiResponse(200, '게시물이 생성되었습니다.');
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('게시물 생성에 실패했습니다.');
    }
  }

  // async findOne(id: number) {
  //   const post = await this.postRepository.findOne({
  //     where: {
  //       id,
  //     },
  //     relations: ['comments', 'comments.likes', 'comments.children'],
  //   });

  //   if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

  //   const comments = await this.commentRepository.find({
  //     where: {
  //       post: { id },
  //       parent: IsNull(),
  //     },
  //     order: { createdAt: 'ASC' },
  //     relations: ['children'],
  //   });

  //   const { author, title, content } = post;

  //   return {
  //     statusCode: 200,
  //     author,
  //     title,
  //     content,
  //     comments,
  //     commentCount: comments.length,
  //   };
  // }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['comments', 'comments.children', 'likes'],
    });

    if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

    const parentComments = post.comments.filter((comment) => !comment.parent);

    const childrenComments = (comment: Comment): CommentDetailDto => ({
      id: comment.id,
      content: comment.content,
      childrenCount: comment.children?.length ?? 0,
      children: (comment.children ?? []).map(childrenComments),
    });

    const commentsCount = parentComments.reduce((acc, cur) => {
      return acc + (cur.children?.length || 0) + 1; // +1 for the parent comment itself
    }, 0);

    return createApiResponse(
      200,
      '단일 게시글 조회에 성공하였습니다.',
      {
        id: post.id,
        title: post.title,
        author: post.author,
        content: post.content,
        // likes: post.likes,
        likeCounts: post.likes.length,
        commentsCount: commentsCount,
        comments: parentComments.map(childrenComments),
      },
      PostDetailResponseDto,
    );
  }

  async update(request: AuthRequest, id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'], // relations을 지정해줘야만 userId 가져옴
    });

    const user = await this.userRepository.findOneBy({
      id: request.user.id,
    });

    if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

    if (user?.id !== post.user.id)
      throw new UnauthorizedException('게시물 작성자만 수정할 수 있습니다.');

    const updatedPost = Object.assign(post, updatePostDto);
    await this.postRepository.save(updatedPost);

    return createApiResponse(200, '게시물이 수정되었습니다.');
  }

  async delete(request: AuthRequest, id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    const user = await this.userRepository.findOneBy({
      id: request.user.id,
    });

    if (!post) throw new NotFoundException('이미 삭제된 게시물입니다.');

    if (user?.id !== post.user.id)
      throw new UnauthorizedException('게시물 작성자만 삭제할 수 있습니다.');

    await this.postRepository.softDelete({ id });

    return createApiResponse(200, '게시물이 삭제되었습니다.');
  }
}
