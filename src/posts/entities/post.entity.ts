import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  RelationId,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Likes } from 'src/likes/entities/likes.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Exclude()
  @RelationId((post: Post) => post.user)
  userId: number;

  @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Exclude()
  @RelationId((post: Post) => post.category)
  categoryId: number | null;

  // Self-referencing for thread/reply structure
  @ManyToOne(() => Post, (post: Post) => post.childrenPosts, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentPostId' })
  parentPost: Post | null;

  @Exclude()
  @RelationId((post: Post) => post.parentPost)
  parentPostId: number | null;

  @OneToMany(() => Post, (post: Post) => post.parentPost)
  childrenPosts: Post[];

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  author: string;

  @Column('text')
  content: string;

  @OneToMany(() => Likes, (likes) => likes.post)
  likes: Likes[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
