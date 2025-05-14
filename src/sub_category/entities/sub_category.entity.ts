import { Category } from 'src/category/entities/category.entity';
import { Post } from 'src/post/entities/post.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.subCategories)
  category: Category;

  @OneToMany(() => Post, (post) => post.subCategory)
  posts: Post[];
}
