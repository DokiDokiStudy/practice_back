import { Posts } from 'src/posts/entities/posts.entity';
import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Categories {
  @OneToMany(() => Posts, (post) => post.category)
  posts: Posts[];
  @OneToMany(() => Categories, (category) => category.parent)
  children: Categories[];
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Categories, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Categories;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
