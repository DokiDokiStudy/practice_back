import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ length: 50 })
  reactionType: string;
}
