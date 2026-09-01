import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryDto, CategoryService } from './category.service';

@ApiTags('categories')
@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ description: 'Category options' })
  @ApiInternalServerErrorResponse({ description: 'Category retrieval failed safely' })
  async list(): Promise<{
    success: true;
    message: string;
    data: CategoryDto[];
  }> {
    const data = await this.categoryService.findAll();
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data,
    };
  }
}
