import { ApiProperty } from "@nestjs/swagger";
import { Post } from "src/post/entities/post.entity";
import { Column, CreateDateColumn, DeleteDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Subcategory } from "./sub.caterory.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '공지사항' })
  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Subcategory, (sub) => sub.category)
  subcategories: Subcategory[];

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @UpdateDateColumn()
  updatedAt: Date;
  
  @DeleteDateColumn()
  deletedAt: Date;
}