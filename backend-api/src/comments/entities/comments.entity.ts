import { User } from 'src/users/entities/user.entity';
import { Posts } from 'src/posts/entities/posts.entity';
import { Likes } from 'src/likes/entities/likes.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Comments {
  @OneToMany(() => Comments, (comment) => comment.parent)
  children: Comments[];
  @OneToMany(() => Likes, (like) => like.comment)
  likes: Likes[];
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Posts, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Posts;

  @ManyToOne(() => Comments, (comment) => comment.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Comments;

  @Column()
  name: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
