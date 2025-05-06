import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/post/entities/post.entity';
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
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'test@gmail.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'password' })
  @Column()
  password: string;

  @ApiProperty({ example: 'nickname' })
  @Column()
  nickName: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

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

  @ApiProperty({ example: '당신의 출신 초등학교는?' })
  @Column()
  securityQuestion: string;

  @ApiProperty({ example: '서울초등학교' })
  @Column()
  securityAnswer: string;
}
