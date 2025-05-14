import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/comment/entities/comment.entity';
import { SubCategory } from 'src/sub_category/entities/sub_category.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // 기본값은 property + id
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' }) // 사용자 삭제시 작성한 게시글도 삭제
  // @JoinColumn({ name: 'author_id' }) 원하는 컬럼 이름 설정
  user: User;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.posts)
  subCategory: SubCategory;

  @ApiProperty({ example: '홍길동' })
  @Column()
  author: string;

  @ApiProperty({ example: '게시물 제목' })
  @Column()
  title: string;

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

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
