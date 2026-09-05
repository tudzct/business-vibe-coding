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
      const savingGoal = await goalRepository
        .createQueryBuilder('goal')
        .where('goal.userId = :userId', { userId })
        .andWhere('goal.goalType = :savingType', {
          savingType: GoalType.SAVING,
        })
        .andWhere('goal.startDate <= goal.endDate')
        .andWhere('goal.startDate <= :monthEnd', { monthEnd })
        .andWhere('goal.endDate >= :monthStart', { monthStart })
        .orderBy('goal.startDate', 'DESC')
        .addOrderBy('goal.goalId', 'DESC')
        .getOne();
      const expenseGoals = await goalRepository
        .createQueryBuilder('goal')
        .leftJoinAndSelect('goal.category', 'category')
        .where('goal.userId = :userId', { userId })
        .andWhere('goal.goalType = :expenseType', {
          expenseType: GoalType.EXPENSE_LIMIT,
        })
        .andWhere('goal.startDate <= goal.endDate')
        .andWhere('goal.startDate <= :monthEnd', { monthEnd })
        .andWhere('goal.endDate >= :monthStart', { monthStart })
        .getMany();

      const accounts = await this.dataSource.getRepository(Account).find({
        select: { accountId: true },
        where: { userId },
      });
      const accountIds = accounts.map((account) => account.accountId);
      const transactionRepository = this.dataSource.getRepository(Transaction);
      const monthTransactions = accountIds.length === 0
        ? []
        : await transactionRepository.findBy({
            accountId: In(accountIds),
            transactionDate: Between(monthStart, monthEnd),
          });

      const savingTransactions = savingGoal && accountIds.length > 0
        ? await transactionRepository.findBy({
            accountId: In(accountIds),
            transactionDate: Between(
              new Date(Math.max(
                monthStart.getTime(),
                new Date(`${this.toIsoDate(savingGoal.startDate)}T00:00:00.000Z`).getTime(),
              )),
              new Date(Math.min(
                monthEnd.getTime(),
                new Date(`${this.toIsoDate(savingGoal.endDate)}T00:00:00.000Z`).getTime(),
              )),
            ),
          })
        : [];

      const totalRevenue = this.sumTransactions(
        savingTransactions.filter((transaction) => transaction.type === TransactionType.REVENUE),
      );
      const totalExpense = this.sumTransactions(
        savingTransactions.filter((transaction) => transaction.type === TransactionType.EXPENSE),
      );

      const expenseGoalData = expenseGoals.map((goal) => {
        const monthStartIso = this.toIsoDate(monthStart);
        const monthEndIso = this.toIsoDate(monthEnd);
        const goalStartIso = this.toIsoDate(goal.startDate);
        const goalEndIso = this.toIsoDate(goal.endDate);
        const periodStart = goalStartIso > monthStartIso
          ? goalStartIso
          : monthStartIso;
        const periodEnd = goalEndIso < monthEndIso
          ? goalEndIso
          : monthEndIso;
        const categoryName = goal.category?.categoryName.trim();
        const currentExpense = this.sumTransactions(
          monthTransactions.filter((transaction) => {
            const transactionDate = this.toIsoDate(transaction.transactionDate);
            return transaction.type === TransactionType.EXPENSE
              && transaction.categoryId === goal.categoryId
              && transactionDate >= periodStart
              && transactionDate <= periodEnd;
          }),
        );

        return {
          goal,
          dto: {
            goal_id: goal.goalId,
            category: goal.categoryId === null
              ? 'Uncategorized'
              : (categoryName || 'Unknown'),
            target_amount: this.round2(Number(goal.targetAmount)),
            current_expense: this.round2(currentExpense),
          },
        };
      });

      expenseGoalData.sort((left, right) => {
        const leftExceeded = left.dto.current_expense >= left.dto.target_amount;
        const rightExceeded = right.dto.current_expense >= right.dto.target_amount;
        if (leftExceeded !== rightExceeded) return leftExceeded ? -1 : 1;

        const endDateOrder = this.toIsoDate(left.goal.endDate)
          .localeCompare(this.toIsoDate(right.goal.endDate));
        if (endDateOrder !== 0) return endDateOrder;

        const targetOrder = left.dto.target_amount - right.dto.target_amount;
        if (targetOrder !== 0) return targetOrder;
        return left.dto.goal_id - right.dto.goal_id;
      });

      return {
        savingGoal: savingGoal
          ? {
              goal_id: savingGoal.goalId,
              goal_type: GoalType.SAVING,
              target_amount: this.round2(Number(savingGoal.targetAmount)),
              target_achieved: this.round2(totalRevenue - totalExpense),
              start_date: this.toIsoDate(savingGoal.startDate),
              end_date: this.toIsoDate(savingGoal.endDate),
            }
          : null,
        expenseGoals: expenseGoalData.map(({ dto }) => dto),
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

  private round2(value: number): number {
    return Math.sign(value)
      * Math.round((Math.abs(value) + Number.EPSILON) * 100)
      / 100;
  }

  private toIsoDate(value: Date | string): string {
    return typeof value === 'string'
      ? value.slice(0, 10)
      : value.toISOString().slice(0, 10);
  }
}
