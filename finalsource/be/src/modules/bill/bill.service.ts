import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './bill.entity';
import type { BillDto } from './bill.types';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly bills: Repository<Bill>,
  ) {}

  async findUpcomingBillsByUserId(userId: number): Promise<BillDto[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const windowEnd = new Date(today);
      windowEnd.setDate(windowEnd.getDate() + 30);

      const bills = await this.bills
        .createQueryBuilder('bill')
        .where('bill.userId = :userId', { userId })
        .andWhere('bill.dueDate >= :today', { today })
        .andWhere('bill.dueDate <= :windowEnd', { windowEnd })
        .andWhere(
          '(bill.lastChargeDate IS NULL OR bill.lastChargeDate < bill.dueDate)',
        )
        .orderBy('bill.dueDate', 'ASC')
        .addOrderBy('bill.amount', 'DESC')
        .addOrderBy('bill.billId', 'ASC')
        .getMany();
      return bills.map((bill) => this.toDto(bill));
    } catch {
      throw new InternalServerErrorException('Failed to fetch bills');
    }
  }

  private toDto(bill: Bill): BillDto {
    const amount = Number(bill.amount);
    if (!Number.isFinite(amount)) {
      throw new Error('Invalid bill amount');
    }

    const logoUrl = bill.logoUrl?.trim();

    return {
      billId: bill.billId,
      userId: bill.userId,
      itemDescription: bill.itemDescription.trim(),
      logoUrl: logoUrl || null,
      dueDate: this.toIsoDate(bill.dueDate),
      lastChargeDate: bill.lastChargeDate
        ? this.toIsoDate(bill.lastChargeDate)
        : null,
      amount: this.round2(amount),
    };
  }

  private round2(value: number): number {
    return Math.round((value + Math.sign(value) * Number.EPSILON) * 100) / 100;
  }

  private toIsoDate(value: Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid bill date');
    }
    return date.toISOString().slice(0, 10);
  }
}
