
import { LoanSummary, ScheduleEntry } from '../types';

export const calculateEMI = (principal: number, annualRate: number, tenureYears: number): LoanSummary => {
  const monthlyRate = annualRate / 12 / 100;
  const tenureMonths = tenureYears * 12;
  
  // EMI formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
  const emi = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;

  return {
    monthlyEmi: emi,
    totalInterest: totalInterest,
    totalPayable: totalPayable,
    principalAmount: principal,
    tenureMonths: tenureMonths
  };
};

export const generateSchedule = (principal: number, annualRate: number, tenureYears: number, emi: number): ScheduleEntry[] => {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const schedule: ScheduleEntry[] = [];
  let balance = principal;
  const startYear = new Date().getFullYear();
  const startMonth = new Date().getMonth();

  for (let i = 1; i <= totalMonths; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    
    const date = new Date(startYear, startMonth + i);

    schedule.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      emi: emi,
      principal: principalPaid,
      interest: interest,
      balance: balance
    });
  }

  return schedule;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
