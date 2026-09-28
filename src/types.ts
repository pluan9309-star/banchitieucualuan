export type TransactionType = 'expense' | 'income' | 'savings_deposit';

export type PaymentMethod = 'cash' | 'bank' | 'e_wallet';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  description?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  savingsGoalId?: string; // If transferred to a specific savings goal
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  period: string; // "YYYY-MM" or "monthly"
  alertThreshold: number; // e.g., 0.8 (80%)
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  categoryTag: string; // e.g. "Dự phòng", "Mua sắm", "Du lịch", "Đầu tư"
  color: string;
  note: string;
  icon: string;
  createdAt: string;
}

export type ActiveTab = 'overview' | 'transactions' | 'analytics' | 'budgets' | 'savings';
