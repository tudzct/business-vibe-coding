export interface ExpenseSubCategory {
  item_description: string;
  amount: number;
  date: string;
}

export interface BreakdownResult {
  category: string;
  total: number;
  changePercent: number | null;
  subCategories: ExpenseSubCategory[];
}

export interface ExpenseBreakdownResponse {
  success: true;
  message: string;
  data: BreakdownResult[];
}
