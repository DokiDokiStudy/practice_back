import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReactionType } from '../type/reactionType';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Comment, (comment: Comment) => comment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ type: 'enum', enum: ReactionType })
  reactionType: ReactionType;
}
