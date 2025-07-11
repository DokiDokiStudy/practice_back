import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Post, Like])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
