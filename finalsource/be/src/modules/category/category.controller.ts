import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@ApiTags('categories')
@Controller('api/categories')
export class CategoryController {
  constructor(@InjectRepository(Category) private readonly categories: Repository<Category>) {}

  @Get()
  @ApiOkResponse({ description: 'Category options' })
  async list(): Promise<{
    success: true;
    message: string;
    data: Array<{ category_id: number; category_name: string }>;
  }> {
    const categories = await this.categories.find({ order: { categoryName: 'ASC' } });
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories.map((category) => ({
        category_id: category.categoryId,
        category_name: category.categoryName,
      })),
    };
  }
}
