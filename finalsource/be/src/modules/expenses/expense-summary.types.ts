export interface ExpenseSummaryItem {
  month: string;
  totalExpense: number;
}

export interface ExpenseSummaryResponse {
  success: true;
  message: string;
  data: ExpenseSummaryItem[];
}
