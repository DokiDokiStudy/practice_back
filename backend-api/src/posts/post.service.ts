import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './entities/post.entity';
import { AuthRequest } from 'src/auth/type/jwt';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async get() {
    const posts = await this.postRepository.find();

    return {
      statusCode: 200,
      posts,
    };
  }

  async create(request: AuthRequest, createPostDto: CreatePostDto) {
    const { id, nickName } = request.user;
    const { title, content } = createPostDto;

    await this.postRepository.save({
      user: { id },
      author: nickName,
      title,
      content,
    });

    return {
      statusCode: 201,
      message: '게시물이 생성되었습니다.',
    };
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOneBy({
      id,
    });

    if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

    const { author, title, content } = post;

    return {
      statusCode: 200,
      author,
      title,
      content,
    };
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

    return {
      statusCode: 200,
      message: '게시물이 수정되었습니다.',
    };
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

    return {
      statusCode: 200,
      message: '게시물이 삭제되었습니다.',
    };
  }
}
