import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetsView } from './components/BudgetsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { SavingsGoalModal } from './components/SavingsGoalModal';
import { SavingsDepositModal } from './components/SavingsDepositModal';
import {
  ActiveTab,
  Transaction,
  Budget,
  SavingsGoal,
  Category,
} from './types';
import {
  loadCategories,
  saveCategories,
  loadTransactions,
  saveTransactions,
  loadBudgets,
  saveBudgets,
  loadSavingsGoals,
  saveSavingsGoals,
  resetToSampleData,
} from './data/storage';
import { formatVND } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => loadBudgets());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => loadSavingsGoals());

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeGoalForDeposit, setActiveGoalForDeposit] = useState<SavingsGoal | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync to storage
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveSavingsGoals(savingsGoals);
  }, [savingsGoals]);

  // Transaction Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...txData } : t))
      );
      showToast('Đã cập nhật giao dịch thành công');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // If it's a savings deposit linked to a goal, increment that goal
      if (newTx.type === 'savings_deposit' && newTx.savingsGoalId) {
        setSavingsGoals((prev) =>
          prev.map((g) =>
            g.id === newTx.savingsGoalId
              ? { ...g, currentAmount: g.currentAmount + newTx.amount }
              : g
          )
        );
      }
      showToast(`Đã thêm ghi chép ${formatVND(newTx.amount)} thành công`);
    }
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xoá giao dịch khỏi sổ');
  };

  // Budget Handlers
  const handleSaveBudget = (budgetData: Omit<Budget, 'id'>, editingId?: string) => {
    if (editingId) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, ...budgetData } : b))
      );
      showToast('Đã cập nhật định mức ngân sách');
    } else {
      const newBudget: Budget = {
        ...budgetData,
        id: `b-${Date.now()}`,
      };
      setBudgets((prev) => [...prev, newBudget]);
      showToast('Đã thiết lập hạn mức ngân sách mới');
    }
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Đã gỡ bỏ hạn mức ngân sách');
  };

  // Savings Goal Handlers
  const handleSaveSavingsGoal = (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === editingId ? { ...g, ...goalData } : g))
      );
      showToast('Đã cập nhật mục tiêu tiết kiệm');
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSavingsGoals((prev) => [...prev, newGoal]);
      showToast(`Đã tạo mục tiêu "${newGoal.title}"`);
    }
    setEditingGoal(null);
  };

  const handleDeleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Đã xoá mục tiêu tiết kiệm');
  };

  const handleGoalDepositWithdraw = (
    goalId: string,
    deltaAmount: number,
    action: 'deposit' | 'withdraw',
    note: string
  ) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount + deltaAmount) } : g
      )
    );

    // Record an automated transaction in the ledger
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: action === 'deposit' ? 'savings_deposit' : 'income',
      amount: Math.abs(deltaAmount),
      categoryId: action === 'deposit' ? 'salary' : 'other_inc',
      date: new Date().toISOString().split('T')[0],
      note: note || (action === 'deposit' ? `Nạp vào: ${targetGoal?.title}` : `Rút từ: ${targetGoal?.title}`),
      paymentMethod: 'bank',
      savingsGoalId: goalId,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(
      action === 'deposit'
        ? `Đã nạp ${formatVND(Math.abs(deltaAmount))} vào quỹ "${targetGoal?.title}"`
        : `Đã rút ${formatVND(Math.abs(deltaAmount))} từ quỹ "${targetGoal?.title}"`
    );
  };

  const handleResetData = () => {
    const data = resetToSampleData();
    setCategories(data.categories);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setSavingsGoals(data.savingsGoals);
    showToast('Đã khôi phục dữ liệu mẫu chuẩn');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onResetData={handleResetData}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* Main Content Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardView
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            savingsGoals={savingsGoals}
            selectedMonth={selectedMonth}
            onOpenAddTransaction={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onQuickDeposit={(goal) => {
              setActiveGoalForDeposit(goal);
              setIsDepositModalOpen(true);
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            selectedMonth={selectedMonth}
            onOpenAddTransaction={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            selectedMonth={selectedMonth}
            onOpenAddBudget={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={(b) => {
              setEditingBudget(b);
              setIsBudgetModalOpen(true);
            }}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGoalsView
            savingsGoals={savingsGoals}
            onOpenAddGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteSavingsGoal}
            onOpenDeposit={(goal) => {
              setActiveGoalForDeposit(goal);
              setIsDepositModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        savingsGoals={savingsGoals}
        editingTransaction={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        categories={categories}
        existingBudgets={budgets}
        editingBudget={editingBudget}
      />

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveSavingsGoal}
        editingGoal={editingGoal}
      />

      <SavingsDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setActiveGoalForDeposit(null);
        }}
        goal={activeGoalForDeposit}
        onConfirm={handleGoalDepositWithdraw}
      />

      {/* Clean quiet toast notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">FinTrack VN</span>
            <span className="mx-2">·</span>
            <span>Hệ thống quản lý tài chính cá nhân & ngân sách tiết kiệm</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Dữ liệu lưu trữ cục bộ bảo mật trên trình duyệt</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Dữ liệu mẫu
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
