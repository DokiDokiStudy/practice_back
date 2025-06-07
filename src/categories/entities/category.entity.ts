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
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  // 실제 DB 컬럼이 생김 (외래 키)
  @ManyToOne(() => Category, (category: Category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category;

  // DB에는 컬럼이 생기지 않지만 ORM에서는 역참조 용도로 사용 가능
  @OneToMany(() => Category, (category: Category) => category.parent)
  children: Category[];

  @OneToMany(() => Post, (post: Post) => post.category)
  posts: Post[];

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
