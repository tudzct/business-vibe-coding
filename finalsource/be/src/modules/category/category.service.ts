import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

export interface CategoryListItemDto {
  readonly category_id: number;
  readonly category_name: string;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryListItemDto[]> {
    try {
      const categories = await this.categories.find({ order: { categoryName: 'ASC' } });
      return categories.map((category) => ({
        category_id: category.categoryId,
        category_name: category.categoryName,
      }));
    } catch {
      throw new InternalServerErrorException(
        'The category list could not be loaded. Please try again later.',
      );
    }
  }
}
