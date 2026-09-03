import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request as RequestDecorator,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import {
  CreateGoalDataDto,
  GoalListDataDto,
  GoalService,
  UpdateGoalDataDto,
} from './goal.service';

interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}

interface CreateGoalEnvelope {
  readonly success: true;
  readonly message: 'Goal created successfully';
  readonly data: CreateGoalDataDto;
}

interface UpdateGoalEnvelope {
  readonly success: true;
  readonly message: 'Goal updated successfully';
  readonly data: UpdateGoalDataDto;
}

interface GoalListEnvelope {
  readonly success: true;
  readonly message: 'Lấy danh sách mục tiêu thành công';
  readonly data: GoalListDataDto;
}

@ApiTags('goals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Financial goals loaded successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Goal retrieval failed safely' })
  async getGoals(
    @RequestDecorator() request: AuthenticatedRequest,
  ): Promise<GoalListEnvelope> {
    const data = await this.goalService.getGoals(request.user.userId);
    return { success: true, message: 'Lấy danh sách mục tiêu thành công', data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Goal created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or missing goal data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Goal creation failed safely' })
  async createGoal(
    @RequestDecorator() request: AuthenticatedRequest,
    @Body() dto: CreateGoalDto,
  ): Promise<CreateGoalEnvelope> {
    const data = await this.goalService.createGoal(request.user.userId, dto);
    return { success: true, message: 'Goal created successfully', data };
  }

  @Put(':goalId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Goal updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid goal update data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Goal update failed safely' })
  async updateGoal(
    @RequestDecorator() request: AuthenticatedRequest,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() dto: UpdateGoalDto,
  ): Promise<UpdateGoalEnvelope> {
    const data = await this.goalService.updateGoal(
      request.user.userId,
      goalId,
      dto,
    );
    return { success: true, message: 'Goal updated successfully', data };
  }
}
