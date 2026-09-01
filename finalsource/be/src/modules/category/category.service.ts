import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

export interface CategoryDto {
  category_id: number;
  category_name: string;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    try {
      const rows = await this.categories.find({ order: { categoryId: 'ASC' } });
      return rows.map((category) => ({
        category_id: category.categoryId,
        category_name: category.categoryName,
      }));
    } catch {
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi hệ thống khi lấy danh sách danh mục. Vui lòng thử lại sau.',
      );
    }
  }
}
