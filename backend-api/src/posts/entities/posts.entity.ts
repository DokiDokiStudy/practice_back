import { ApiProperty } from '@nestjs/swagger';
import { Categories } from 'src/categories/entities/categories.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from 'src/comments/entities/comments.entity';

@Entity()
export class Posts {
  @OneToMany(() => Comments, (comment) => comment.post)
  comments: Comments[];

  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' }) // 사용자 삭제시 작성한 게시글도 삭제
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Categories, (category) => category.posts, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Categories;

  @ApiProperty({ example: '게시물 제목' })
  @Column()
  title: string;

  @ApiProperty({ example: '홍길동' })
  @Column()
  author: string;

  @ApiProperty({ example: '게시물 내용' })
  @Column('text')
  content: string;

  @ApiProperty({ example: '0000-00-00' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '0000-00-00' })
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
