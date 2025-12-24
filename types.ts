
export interface ScheduleEntry {
  month: number;
  year: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanSummary {
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  principalAmount: number;
  tenureMonths: number;
}
