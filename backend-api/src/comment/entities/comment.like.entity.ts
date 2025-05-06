import { Entity, JoinColumn, ManyToOne, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './comment.entity';

@Entity()
export class CommentLike {
  @PrimaryColumn()
  commentId: number;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}