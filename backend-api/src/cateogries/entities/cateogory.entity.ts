import { ApiProperty } from "@nestjs/swagger";
import { Post } from "src/post/entities/post.entity";
import { Column, CreateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '공지사항' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: null, description: 'null이면 최상위 카테고리' })
  @Column({ nullable: true })
  parentId: number | null;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @UpdateDateColumn()
  updatedAt: Date;
  
  @DeleteDateColumn()
  deletedAt: Date;
}