import { ApiProperty } from "@nestjs/swagger";
import { Post } from "src/post/entities/post.entity";
import { Column, CreateDateColumn, DeleteDateColumn, OneToMany, UpdateDateColumn } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ManyToOne } from "typeorm/decorator/relations/ManyToOne";
import { Category } from "./cateogory.entity";

@Entity()
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.subcategories)
  category: Category;

  @ApiProperty({ example: '이벤트' })
  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Post, (post) => post.subcategory)
  posts: Post[];

  @UpdateDateColumn()
  updatedAt: Date;
    
  @DeleteDateColumn()
  deletedAt: Date;
}