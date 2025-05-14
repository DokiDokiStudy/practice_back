import { MainCategory } from 'src/main_category/entities/main_category.entity';
import { SubCategory } from 'src/sub_category/entities/sub_category.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => MainCategory, (mainCategory) => mainCategory.categories)
  mainCategory: MainCategory;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[];
}
