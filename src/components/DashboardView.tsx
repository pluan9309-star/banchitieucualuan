import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, Category, Budget, SavingsGoal } from '../types';
import { formatVND, formatCompactVND, getRelativeDateText } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { CategoryDonutChart } from './Charts/CategoryDonutChart';
import { MonthlyBarChart } from './Charts/MonthlyBarChart';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  selectedMonth: string;
  onOpenAddTransaction: () => void;
  onNavigateToTab: (tab: 'transactions' | 'analytics' | 'budgets' | 'savings') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onQuickDeposit: (goal: SavingsGoal) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  budgets,
  savingsGoals,
  selectedMonth,
  onOpenAddTransaction,
  onNavigateToTab,
  onEditTransaction,
  onDeleteTransaction,
  onQuickDeposit,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Monthly metrics
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavingsDeposit = monthTransactions
    .filter((t) => t.type === 'savings_deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense - totalSavingsDeposit;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Total in all savings goals
  const totalInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetGoals = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallGoalProgress = totalTargetGoals > 0 ? (totalInGoals / totalTargetGoals) * 100 : 0;

  // Check budgets
  const budgetAlerts = budgets.map((b) => {
    const spent = monthTransactions
      .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    const cat = categoryMap.get(b.categoryId);
    const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const isExceeded = spent >= b.monthlyLimit;
    const isWarning = !isExceeded && spent >= b.monthlyLimit * b.alertThreshold;

    return {
      budget: b,
      categoryName: cat?.name || 'Danh mục',
      icon: cat?.icon || 'Tag',
      color: cat?.color || '#94A3B8',
      spent,
      limit: b.monthlyLimit,
      percent,
      isExceeded,
      isWarning,
    };
  });

  const criticalAlerts = budgetAlerts.filter((a) => a.isExceeded || a.isWarning);

  // Recent 5 transactions
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng thu nhập tháng</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatVND(totalIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 font-medium">Đã ghi nhận</span>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng chi tiêu tháng</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatVND(totalExpense)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>{totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(0)}% thu nhập` : 'Chưa có thu'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 font-medium tabular-nums">{monthTransactions.filter(t => t.type === 'expense').length} khoản</span>
            </div>
          </div>
        </div>

        {/* Net Balance & Savings Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Số dư khả dụng tháng</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tabular-nums ${netBalance >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
              {formatVND(netBalance)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>Tỷ lệ tích luỹ:</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                {savingsRate > 0 ? `${savingsRate.toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Total In Savings Goals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng tài sản trong quỹ</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-sky-900 tabular-nums">
              {formatVND(totalInGoals)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="tabular-nums font-medium text-sky-700">{overallGoalProgress.toFixed(0)}%</span>
              <span>mục tiêu tổng</span>
              <span aria-hidden="true">·</span>
              <span>{savingsGoals.length} mục tiêu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts Banner if approaching limit */}
      {criticalAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Cảnh báo ngân sách ({criticalAlerts.length} danh mục chạm ngưỡng)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {criticalAlerts
                  .map(
                    (a) =>
                      `${a.categoryName} (${a.percent.toFixed(0)}% - đã chi ${formatCompactVND(
                        a.spent
                      )}/${formatCompactVND(a.limit)})`
                  )
                  .join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('budgets')}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Quản lý ngân sách
          </button>
        </div>
      )}

      {/* Main Visuals Grid: Category Donut & Weekly Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Breakdown Donut Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Phân loại chi tiêu tháng</h3>
              <p className="text-xs text-slate-500">Tỷ trọng các danh mục chi tiêu trong tháng {selectedMonth}</p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-4">
            <CategoryDonutChart
              transactions={monthTransactions}
              categories={categories}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Di chuột vào từng cung tròn để xem chi tiết chi phí</span>
            <button
              onClick={() => onNavigateToTab('budgets')}
              className="text-slate-700 font-medium hover:underline"
            >
              Điều chỉnh định mức →
            </button>
          </div>
        </div>

        {/* Right: Weekly Cashflow Bar Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dòng tiền các tuần</h3>
              <p className="text-xs text-slate-500">So sánh Thu nhập vs Chi tiêu vs Tiết kiệm</p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Phân tích
            </button>
          </div>

          <div className="py-4">
            <MonthlyBarChart transactions={transactions} selectedMonth={selectedMonth} />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tiết kiệm ròng tuần 1-4</span>
            <span className="font-semibold text-emerald-600 tabular-nums">
              +{formatVND(Math.max(totalIncome - totalExpense, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Second Row: Savings Goals Highlights & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Savings Goals Progress */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mục tiêu tiết kiệm</h3>
              <p className="text-xs text-slate-500">Kế hoạch tích lũy dài hạn & các quỹ dự phòng</p>
            </div>
            <button
              onClick={() => onNavigateToTab('savings')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Tất cả ({savingsGoals.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 py-2">
            {savingsGoals.slice(0, 3).map((goal) => {
              const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isFinished = goal.currentAmount >= goal.targetAmount;

              return (
                <div key={goal.id} className="py-3 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
                      >
                        <CategoryIcon name={goal.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{goal.title}</h4>
                          {isFinished && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <span>{goal.categoryTag}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{goal.targetDate}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onQuickDeposit(goal)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors shrink-0"
                    >
                      + Nạp
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] tabular-nums">
                      <span className="font-semibold text-slate-800">
                        {formatCompactVND(goal.currentAmount)}
                      </span>
                      <span className="text-slate-400">
                        Mục tiêu: {formatCompactVND(goal.targetAmount)} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('savings')}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Thiết lập mục tiêu mới
            </button>
          </div>
        </div>

        {/* Right: Recent Transactions List */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ghi chép gần đây</h3>
              <p className="text-xs text-slate-500">Các giao dịch thu chi mới nhất trong tháng</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddTransaction}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi chép</span>
              </button>
              <button
                onClick={() => onNavigateToTab('transactions')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Xem tất cả
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 py-1">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có giao dịch nào trong tháng {selectedMonth}.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/60 rounded-lg px-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat?.color || '#94A3B8'}15`,
                          color: cat?.color || '#64748B',
                        }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {tx.note || cat?.name || 'Giao dịch'}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span>{cat?.name || 'Khác'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{getRelativeDateText(tx.date)}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {tx.paymentMethod === 'bank'
                              ? 'Ngân hàng'
                              : tx.paymentMethod === 'e_wallet'
                              ? 'Ví điện tử'
                              : 'Tiền mặt'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold tabular-nums block ${
                            isIncome
                              ? 'text-emerald-600'
                              : isExpense
                              ? 'text-rose-600'
                              : 'text-sky-600'
                          }`}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatVND(tx.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isIncome ? 'Thu nhập' : isExpense ? 'Chi tiêu' : 'Tích luỹ'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị 6 giao dịch gần nhất</span>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-slate-700 font-semibold hover:underline"
            >
              Mở sổ giao dịch đầy đủ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
