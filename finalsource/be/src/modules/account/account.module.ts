import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from './account.controller';
import { AccountDetailJwtAuthGuard } from './account-detail-jwt-auth.guard';
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { Transaction } from '../transaction/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction]), AuthModule],
  controllers: [AccountController],
  providers: [AccountService, AccountDetailJwtAuthGuard],
})
export class AccountModule {}
