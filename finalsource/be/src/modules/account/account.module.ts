import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { AccountService } from './account.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), AuthModule],
  controllers: [AccountController],
  providers: [AccountService, JwtAuthGuard],
})
export class AccountModule {}
