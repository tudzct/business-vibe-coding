import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Between,
  DataSource,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';
import { Transaction, TransactionType } from '../transaction/transaction.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal, GoalType } from './goal.entity';

export interface CreateGoalDataDto {
  readonly goal_id: number;
}

export interface UpdateGoalDataDto {
  readonly updated_goal: {
    readonly goal_id: number;
    readonly target_amount: number;
  };
}

interface SavingGoalDataDto {
  readonly goal_id: number;
  readonly goal_type: GoalType.SAVING;
  readonly target_amount: number;
  readonly target_achieved: number;
  readonly start_date: string;
  readonly end_date: string;
}

interface ExpenseGoalDataDto {
  readonly goal_id: number;
  readonly category: string;
  readonly target_amount: number;
  readonly current_expense: number;
}

export interface GoalListDataDto {
  readonly savingGoal: SavingGoalDataDto | null;
  readonly expenseGoals: ExpenseGoalDataDto[];
}

@Injectable()
export class GoalService {
  constructor(private readonly dataSource: DataSource) {}

  async getGoals(userId: number): Promise<GoalListDataDto> {
    try {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthEnd = new Date(Date.UTC(
        monthStart.getUTCFullYear(),
        monthStart.getUTCMonth() + 1,
        0,
      ));

      const goalRepository = this.dataSource.getRepository(Goal);
      const savingGoal = await goalRepository.findOne({
        where: { userId, goalType: GoalType.SAVING },
      });
      const expenseGoals = await goalRepository.find({
        where: {
          userId,
          goalType: GoalType.EXPENSE_LIMIT,
          startDate: LessThanOrEqual(monthEnd),
          endDate: MoreThanOrEqual(monthStart),
        },
        relations: { category: true },
      });

      const accounts = await this.dataSource.getRepository(Account).find({
        select: { accountId: true },
        where: { userId },
      });
      const accountIds = accounts.map((account) => account.accountId);
      const transactions = accountIds.length === 0
        ? []
        : await this.dataSource.getRepository(Transaction).findBy({
            accountId: In(accountIds),
            transactionDate: Between(monthStart, monthEnd),
          });

      const totalRevenue = this.sumTransactions(
        transactions.filter((transaction) => transaction.type === TransactionType.REVENUE),
      );
      const totalExpense = this.sumTransactions(
        transactions.filter((transaction) => transaction.type === TransactionType.EXPENSE),
      );

      return {
        savingGoal: savingGoal
          ? {
              goal_id: savingGoal.goalId,
              goal_type: GoalType.SAVING,
              target_amount: Number(savingGoal.targetAmount),
              target_achieved: totalRevenue - totalExpense,
              start_date: this.toIsoDate(savingGoal.startDate),
              end_date: this.toIsoDate(savingGoal.endDate),
            }
          : null,
        expenseGoals: expenseGoals.map((goal) => ({
          goal_id: goal.goalId,
          category: goal.category?.categoryName ?? 'Unknown',
          target_amount: Number(goal.targetAmount),
          current_expense: this.sumTransactions(
            transactions.filter((transaction) => (
              transaction.type === TransactionType.EXPENSE
              && transaction.categoryId === goal.categoryId
            )),
          ),
        })),
      };
    } catch {
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi hệ thống khi tải mục tiêu, vui lòng thử lại sau.',
      );
    }
  }

  async createGoal(
    userId: number,
    dto: CreateGoalDto,
  ): Promise<CreateGoalDataDto> {
    try {
      return await this.dataSource.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const user = await manager.findOne(User, {
            where: { userId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!user) {
            throw new BadRequestException('Invalid or missing goal data');
          }

          const hasAccount = await manager.existsBy(Account, { userId });
          if (!hasAccount) {
            throw new BadRequestException('Invalid or missing goal data');
          }

          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          this.validateDateWindow(dto.start_date, dto.end_date, today);

          const goalRepository = manager.getRepository(Goal);
          const activeGoalCount = await goalRepository.countBy({
            userId,
            endDate: MoreThanOrEqual(today),
          });
          if (activeGoalCount >= 5) {
            throw new BadRequestException('Invalid or missing goal data');
          }
          if (dto.goal_type === GoalType.SAVING) {
            const activeSavingGoal = await goalRepository.existsBy({
              userId,
              goalType: GoalType.SAVING,
              endDate: MoreThanOrEqual(today),
            });
            if (activeSavingGoal) {
              throw new BadRequestException('Invalid or missing goal data');
            }
          }

          const startDate = new Date(`${dto.start_date}T00:00:00.000Z`);
          const endDate = new Date(`${dto.end_date}T00:00:00.000Z`);
          const categoryId =
            dto.goal_type === GoalType.EXPENSE_LIMIT
              ? (dto.category_id ?? null)
              : null;
          if (
            dto.goal_type === GoalType.EXPENSE_LIMIT
            && categoryId === null
          ) {
            throw new BadRequestException('Invalid or missing goal data');
          }
          if (categoryId !== null) {
            const categoryExists = await manager.existsBy(Category, {
              categoryId,
            });
            if (!categoryExists) {
              throw new BadRequestException('Invalid or missing goal data');
            }
            const overlappingGoal = await goalRepository
              .createQueryBuilder('goal')
              .where('goal.userId = :userId', { userId })
              .andWhere('goal.goalType = :goalType', {
                goalType: GoalType.EXPENSE_LIMIT,
              })
              .andWhere('goal.categoryId = :categoryId', { categoryId })
              .andWhere('goal.startDate <= :endDate', { endDate })
              .andWhere('goal.endDate >= :startDate', { startDate })
              .getExists();
            if (overlappingGoal) {
              throw new BadRequestException('Invalid or missing goal data');
            }
          }

          const goal = manager.create(Goal, {
            userId,
            goalType: dto.goal_type,
            categoryId,
            startDate,
            endDate,
            targetAmount: dto.target_amount,
          });
          const saved = await manager.save(Goal, goal);

          return { goal_id: saved.goalId };
        },
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể tạo mục tiêu lúc này. Vui lòng thử lại sau.',
      );
    }
  }

  async updateGoal(
    userId: number,
    goalId: number,
    dto: UpdateGoalDto,
  ): Promise<UpdateGoalDataDto> {
    try {
      return await this.dataSource.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const goalRepository = manager.getRepository(Goal);
          const goal = await goalRepository.findOne({
            where: { goalId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!goal) {
            throw new NotFoundException('Mục tiêu không tồn tại.');
          }
          const currentDate = new Date().toISOString().slice(0, 10);
          if (this.toIsoDate(goal.endDate) < currentDate) {
            throw new BadRequestException(
              'Không thể điều chỉnh mục tiêu tài chính đã kết thúc.',
            );
          }
          if (goal.userId !== userId) {
            throw new ForbiddenException(
              'Bạn không có quyền chỉnh sửa mục tiêu này.',
            );
          }
          if (Number(goal.targetAmount) === dto.target_amount) {
            throw new BadRequestException('Invalid goal update data');
          }

          goal.targetAmount = dto.target_amount;
          const updatedGoal = await goalRepository.save(goal);

          return {
            updated_goal: {
              goal_id: updatedGoal.goalId,
              target_amount: Number(updatedGoal.targetAmount),
            },
          };
        },
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể lưu thay đổi lúc này. Vui lòng thử lại sau.',
      );
    }
  }

  private validateDateWindow(
    startDateValue: string,
    endDateValue: string,
    today: Date,
  ): void {
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const startDate = new Date(`${startDateValue}T00:00:00.000Z`);
    const endDate = new Date(`${endDateValue}T00:00:00.000Z`);
    const earliestStart = today.getTime() - 7 * dayInMilliseconds;
    const latestStart = today.getTime() + 30 * dayInMilliseconds;
    const durationDays =
      (endDate.getTime() - startDate.getTime()) / dayInMilliseconds;

    if (
      startDate.getTime() < earliestStart
      || startDate.getTime() > latestStart
      || durationDays < 7
      || durationDays > 365
    ) {
      throw new BadRequestException('Invalid or missing goal data');
    }
  }

  private sumTransactions(transactions: Transaction[]): number {
    return transactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    );
  }

  private toIsoDate(value: Date | string): string {
    return typeof value === 'string'
      ? value.slice(0, 10)
      : value.toISOString().slice(0, 10);
  }
}
