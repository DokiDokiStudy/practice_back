import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReactionType } from '../type/reactionType';
import { Post } from 'src/posts/entities/post.entity';

@Index(['user', 'comment'], { unique: true })
@Index(['user', 'post'], { unique: true })
@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Post, (post: Post) => post.likes, { nullable: true })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Comment, (comment: Comment) => comment.likes, {
    nullable: true,
  })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ type: 'enum', enum: ReactionType })
  reactionType: ReactionType;
}
