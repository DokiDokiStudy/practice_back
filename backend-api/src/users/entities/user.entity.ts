import { ApiProperty } from '@nestjs/swagger';
import { Posts } from 'src/posts/entities/posts.entity';
import { Likes } from 'src/likes/entities/likes.entity';
import { Comments } from 'src/comments/entities/comments.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @OneToMany(() => Posts, (post) => post.user)
  posts: Posts[];
  @OneToMany(() => Likes, (like) => like.user)
  likes: Likes[];
  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];

  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'test@gmail.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'password' })
  @Column()
  password: string;

  @ApiProperty({ example: 'name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'nickname' })
  @Column()
  nickName: string;

  @ApiProperty({ example: 'true' })
  @Column()
  isActive: boolean;

  @ApiProperty({ example: '최고 관리자' })
  @Column()
  role: string;

  @ApiProperty({ example: '2025-04-15' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-04-15' })
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
