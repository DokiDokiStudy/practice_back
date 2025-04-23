import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
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

  @ApiProperty({ example: 'name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'nickname' })
  @Column()
  nickName: string;

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
}
