import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category {
  @ApiProperty({
    description: '카테고리 ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '상위 카테고리',
    example: null,
    required: false,
  })
  // 실제 DB 컬럼이 생김 (외래 키)
  @ManyToOne(() => Category, (category: Category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category | null;

  @ApiProperty({
    description: '하위 카테고리 목록',
    type: () => [Category],
    example: [],
  })
  // DB에는 컬럼이 생기지 않지만 ORM에서는 역참조 용도로 사용 가능
  @OneToMany(() => Category, (category: Category) => category.parent)
  children: Category[];

  @ApiProperty({
    description: '해당 카테고리의 게시물 목록',
    type: () => [Post],
    example: [],
  })
  @OneToMany(() => Post, (post: Post) => post.category)
  posts: Post[];

  @ApiProperty({
    description: '카테고리 이름',
    example: 'docker',
  })
  @Column()
  name: string;

  @RelationId((category: Category) => category.parent)
  parentId: number | null;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: '삭제일시',
    example: null,
    required: false,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
