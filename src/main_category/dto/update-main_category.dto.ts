import { PartialType } from '@nestjs/swagger';
import { CreateMainCategoryDto } from './create-main_category.dto';

export class UpdateMainCategoryDto extends PartialType(CreateMainCategoryDto) {}
