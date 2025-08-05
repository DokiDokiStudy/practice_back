import { Likes } from 'src/likes/entities/likes.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Comment, (comment: Comment) => comment.children, {
    nullable: true,
  })
  parent: Comment;

  @OneToMany(() => Comment, (comment: Comment) => comment.parent, {
    nullable: true,
  })
  children: Comment[];

  @ManyToOne(() => User, (user: User) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post: Post) => post.comments)
  post: Post;

  @RelationId((comment: Comment) => comment.post)
  postId: number;

  @Column()
  author: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Likes, (like: Likes) => like.comment, { nullable: true })
  likes: Likes[];
}
