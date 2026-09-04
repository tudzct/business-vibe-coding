import { Controller, Get } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('categories')
@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ description: 'Category list retrieved successfully' })
  @ApiInternalServerErrorResponse({ description: 'Category retrieval failed safely' })
  async findAll() {
    const data = await this.categoryService.findAll();
    return { success: true, message: 'Category list retrieved successfully', data };
  }
}
