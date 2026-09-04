import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { GoalController } from './goal.controller';
import { Goal } from './goal.entity';
import { GoalService } from './goal.service';
import { Transaction } from '../transaction/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Category, Account, Transaction]), AuthModule],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
