import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Comment, User])],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
