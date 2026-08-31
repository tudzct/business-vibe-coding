import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [DatabaseModule, AuthModule, ExpensesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
