import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BillModule } from './modules/bill/bill.module';

@Module({
  imports: [DatabaseModule, AuthModule, AccountModule, ExpensesModule, BillModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
