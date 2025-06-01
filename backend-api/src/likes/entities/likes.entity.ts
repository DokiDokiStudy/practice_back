import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comments } from 'src/comments/entities/comments.entity';

@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Comments, (comment) => comment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: Comments;
}
