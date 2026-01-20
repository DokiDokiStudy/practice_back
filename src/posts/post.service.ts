import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
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
import { PostDetailResponseDto } from './type/post-detail-response.dto';

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
    const { categoryId, parentPostId, page = 1, limit = 10 } = filterDto;

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.parentPost', 'parentPost') // Join parent post
      .loadRelationCountAndMap(
        'post.childrenCount',
        'post.childrenPosts',
      ); // Count children

    // Filter by category
    if (categoryId) {
      query.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    // Filter by parent post (for thread queries)
    if (parentPostId !== undefined) {
      if (parentPostId === null) {
        // Get only top-level posts (no parent)
        query.andWhere('post.parentPostId IS NULL');
      } else {
        // Get threads for specific parent
        query.andWhere('post.parentPostId = :parentPostId', { parentPostId });
      }
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
      const { categoryId, parentPostId, title, content } = createPostDto;

      // BUSINESS RULE VALIDATION
      // Rule: Must provide either categoryId OR parentPostId (or both)
      if (!categoryId && !parentPostId) {
        throw new BadRequestException(
          'categoryId 또는 parentPostId 중 하나는 필수입니다.',
        );
      }

      let category: Category | null = null;
      let parentPost: Post | null = null;

      // PARENT POST VALIDATION (Thread Post)
      if (parentPostId) {
        parentPost = await this.postRepository.findOne({
          where: { id: parentPostId },
          relations: ['category'], // Need parent's category for inheritance
        });

        if (!parentPost) {
          throw new NotFoundException('존재하지 않는 부모 게시글입니다.');
        }

        // Inherit category from parent if not explicitly provided
        if (!categoryId && parentPost.category) {
          category = parentPost.category;
        }
      }

      // CATEGORY VALIDATION (Standalone or Category Override)
      if (categoryId) {
        category = await this.categoryRepository.findOne({
          where: { id: categoryId },
          relations: ['parent'], // Load parent to check if root category
        });

        if (!category) {
          throw new NotFoundException('존재하지 않는 카테고리입니다.');
        }

        // IMPORTANT: Allow root categories (fixes Issue #31-2)
        // No restriction on category depth - all categories are valid
      }

      // FINAL VALIDATION: Ensure category is set
      if (!category) {
        throw new BadRequestException('유효한 카테고리를 지정해야 합니다.');
      }

      // CREATE POST
      const newPost = await this.postRepository.save({
        user: { id },
        author: nickName,
        category,
        parentPost: parentPost ? { id: parentPost.id } : null,
        title,
        content,
      });

      return createApiResponse(200, '게시물이 생성되었습니다.', {
        postId: newPost.id,
        isThread: !!parentPostId,
      });
    } catch (error) {
      console.error('Post creation error:', error);

      // Preserve specific errors
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('게시물 생성에 실패했습니다.');
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
      relations: [
        'comments',
        'comments.children',
        'comments.likes', // Load comment likes
        'comments.children.likes', // Load child comment likes
        'likes',
        'category', // Load category info
        'parentPost', // Load parent post
        'childrenPosts', // Load children posts
        'childrenPosts.user', // Load children authors
      ],
    });

    if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

    const parentComments = post.comments.filter((comment) => !comment.parent);

    // Flat comment structure with depth (Issue #31-4)
    const comments: Array<{
      id: number;
      parentId: number | null;
      depth: number;
      author: string;
      content: string;
      likeCount: number;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    const flattenComments = (comment: Comment, depth: number = 0) => {
      comments.push({
        id: comment.id,
        parentId: comment.parent?.id ?? null,
        depth,
        author: comment.author,
        content: comment.content,
        likeCount: comment.likes?.length ?? 0,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      });

      // Recursively flatten children
      if (comment.children && comment.children.length > 0) {
        comment.children.forEach((child) => flattenComments(child, depth + 1));
      }
    };

    // Flatten all comments starting from parent comments
    parentComments.forEach((comment) => flattenComments(comment));

    const commentsCount = comments.length;

    return createApiResponse(
      200,
      '단일 게시글 조회에 성공하였습니다.',
      {
        id: post.id,
        title: post.title,
        author: post.author,
        content: post.content,
        categoryId: post.categoryId,
        category: post.category
          ? {
              id: post.category.id,
              name: post.category.name,
            }
          : null,
        parentPostId: post.parentPostId, // Parent post ID
        parentPost: post.parentPost
          ? {
              id: post.parentPost.id,
              title: post.parentPost.title,
              author: post.parentPost.author,
            }
          : null,
        // likes: post.likes,
        likeCounts: post.likes.length,
        commentsCount: commentsCount,
        comments, // Flat structure with depth (Issue #31-4)
        childrenPosts: post.childrenPosts.map((child) => ({
          // Children posts (threads)
          id: child.id,
          title: child.title,
          author: child.author,
          createdAt: child.createdAt,
        })),
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
