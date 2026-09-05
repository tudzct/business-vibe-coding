export interface BillDto {
  billId: number;
  userId: number;
  itemDescription: string;
  logoUrl: string | null;
  dueDate: string;
  lastChargeDate: string | null;
  amount: number;
}

export interface BillsResponse {
  success: true;
  message: string;
  data: BillDto[];
}
