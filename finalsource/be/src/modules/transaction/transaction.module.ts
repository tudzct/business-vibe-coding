import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/account.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Category } from '../category/category.entity';
import { TransactionController } from './transaction.controller';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Account, Category]),
    AuthModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, JwtAuthGuard],
  exports: [TransactionService],
})
export class TransactionModule {}
