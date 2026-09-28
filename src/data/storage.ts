import { Category, Transaction, Budget, SavingsGoal } from '../types';
import { INITIAL_CATEGORIES, INITIAL_BUDGETS, INITIAL_SAVINGS_GOALS, INITIAL_TRANSACTIONS } from './initialData';

const STORAGE_KEYS = {
  CATEGORIES: 'fintrack_categories_v1',
  TRANSACTIONS: 'fintrack_transactions_v1',
  BUDGETS: 'fintrack_budgets_v1',
  SAVINGS_GOALS: 'fintrack_savings_goals_v1',
};

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function loadBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      saveBudgets(INITIAL_BUDGETS);
      return INITIAL_BUDGETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BUDGETS;
  }
}

export function saveBudgets(budgets: Budget[]) {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

export function loadSavingsGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (!raw) {
      saveSavingsGoals(INITIAL_SAVINGS_GOALS);
      return INITIAL_SAVINGS_GOALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVINGS_GOALS;
  }
}

export function saveSavingsGoals(goals: SavingsGoal[]) {
  localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
}

export function resetToSampleData(): {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
} {
  saveCategories(INITIAL_CATEGORIES);
  saveTransactions(INITIAL_TRANSACTIONS);
  saveBudgets(INITIAL_BUDGETS);
  saveSavingsGoals(INITIAL_SAVINGS_GOALS);

  return {
    categories: INITIAL_CATEGORIES,
    transactions: INITIAL_TRANSACTIONS,
    budgets: INITIAL_BUDGETS,
    savingsGoals: INITIAL_SAVINGS_GOALS,
  };
}

export function exportDataAsJSON(): string {
  const data = {
    exportDate: new Date().toISOString(),
    categories: loadCategories(),
    transactions: loadTransactions(),
    budgets: loadBudgets(),
    savingsGoals: loadSavingsGoals(),
  };
  return JSON.stringify(data, null, 2);
}

export function exportTransactionsAsCSV(transactions: Transaction[], categories: Category[]): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const typeMap: Record<string, string> = {
    expense: 'Chi tiêu',
    income: 'Thu nhập',
    savings_deposit: 'Gửi tiết kiệm',
  };
  const paymentMap: Record<string, string> = {
    cash: 'Tiền mặt',
    bank: 'Tài khoản ngân hàng',
    e_wallet: 'Ví điện tử',
  };

  const headers = ['Mã GD', 'Ngày', 'Loại', 'Danh mục', 'Số tiền (VNĐ)', 'Phương thức', 'Ghi chú'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    typeMap[t.type] || t.type,
    categoryMap.get(t.categoryId) || 'Khác',
    t.amount.toString(),
    paymentMap[t.paymentMethod] || t.paymentMethod,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
