import { Category } from 'src/category/entities/category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MainCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Category, (category) => category.mainCategory)
  categories: Category[];
}
