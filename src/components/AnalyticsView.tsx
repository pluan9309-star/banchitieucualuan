import React, { useState } from 'react';
import { PieChart, BarChart3, Calendar, CreditCard, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import { Transaction, Category, Budget } from '../types';
import { formatVND, formatCompactVND } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { CategoryDonutChart } from './Charts/CategoryDonutChart';
import { MonthlyBarChart } from './Charts/MonthlyBarChart';
import { DailyTrendChart } from './Charts/DailyTrendChart';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  selectedMonth: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  budgets,
  selectedMonth,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = monthTransactions
    .filter((t) => t.type === 'savings_deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const expenseByCategory = new Map<string, number>();
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory.set(t.categoryId, (expenseByCategory.get(t.categoryId) || 0) + t.amount);
    });

  // Top spending category
  const expenseEntries = Array.from(expenseByCategory.entries());
  const maxExpenseEntry = expenseEntries.length > 0
    ? expenseEntries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), expenseEntries[0])
    : null;

  const topCategoryCat = maxExpenseEntry ? categoryMap.get(maxExpenseEntry[0]) : null;
  const topCategory = maxExpenseEntry
    ? {
        name: topCategoryCat?.name || 'Chưa rõ',
        amount: maxExpenseEntry[1],
        color: topCategoryCat?.color || '#94A3B8',
        icon: topCategoryCat?.icon || 'Tag',
      }
    : null;

  // Payment method breakdown
  const paymentTotals = {
    bank: 0,
    e_wallet: 0,
    cash: 0,
  };
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      if (t.paymentMethod in paymentTotals) {
        paymentTotals[t.paymentMethod] += t.amount;
      }
    });

  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
  const dailyAverageExpense = totalExpense > 0 ? totalExpense / daysInMonth : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Báo Cáo & Biểu Đồ Trực Quan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích chuyên sâu cơ cấu chi tiêu, đối sánh ngân sách và xu hướng dòng tiền
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg tabular-nums">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Kỳ thống kê: Tháng {monthStr}/{yearStr}</span>
        </div>
      </div>

      {/* Top 4 Quick Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Chi tiêu lớn nhất</span>
          <div className="mt-2 flex items-center gap-2.5">
            {topCategory ? (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${topCategory.color}15`,
                    color: topCategory.color,
                  }}
                >
                  <CategoryIcon name={topCategory.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{topCategory.name}</div>
                  <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                    {formatVND(topCategory.amount)}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400">Chưa có dữ liệu</span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Chi tiêu trung bình ngày</span>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {formatVND(dailyAverageExpense)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Dựa trên {daysInMonth} ngày trong tháng</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Tỷ lệ chi tiêu / Thu nhập</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(1)}%` : '0%'}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {totalExpense <= totalIncome * 0.7 ? 'Mức an toàn' : 'Cần cân đối'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Khuyến nghị: Dưới 70% tổng thu</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Tỷ lệ tích luỹ tiết kiệm</span>
          <div className="mt-2 text-xl font-bold text-sky-600 tabular-nums">
            {totalIncome > 0
              ? `${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)}%`
              : '0%'}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Bao gồm quỹ dự phòng & đầu tư</p>
        </div>
      </div>

      {/* Primary Visual Row: Donut Chart & Actual vs Budget Bar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Cơ cấu danh mục chi tiêu</h3>
            <p className="text-xs text-slate-500">Tỷ trọng phần trăm từng nhóm chi phí</p>
          </div>

          <div className="py-4">
            <CategoryDonutChart
              transactions={monthTransactions}
              categories={categories}
              selectedCategoryId={selectedCategoryFilter}
              onSelectCategory={(id) => setSelectedCategoryFilter(id)}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Tổng chi thực tế:</span>
            <span className="font-bold text-slate-900 tabular-nums">{formatVND(totalExpense)}</span>
          </div>
        </div>

        {/* Budget vs Actual Comparison */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Chi tiêu thực tế vs Định mức ngân sách</h3>
              <p className="text-xs text-slate-500">Tiến độ tiêu thụ ngân sách theo từng danh mục</p>
            </div>
          </div>

          <div className="py-3 space-y-4 max-h-[330px] overflow-y-auto pr-1">
            {budgets.map((b) => {
              const cat = categoryMap.get(b.categoryId);
              const spent = expenseByCategory.get(b.categoryId) || 0;
              const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
              const isOver = spent >= b.monthlyLimit;
              const isNear = !isOver && spent >= b.monthlyLimit * (b.alertThreshold || 0.8);

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat?.color || '#94A3B8'}20`,
                          color: cat?.color || '#64748B',
                        }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-800">{cat?.name || 'Danh mục'}</span>
                    </div>

                    <div className="flex items-center gap-2 tabular-nums">
                      <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatCompactVND(spent)}
                      </span>
                      <span className="text-slate-400">/ {formatCompactVND(b.monthlyLimit)}</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isOver ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        ({percent.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : isNear
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>🔴 Quá ngân sách · 🟡 Cận kề ngưỡng cảnh báo · 🟢 An toàn</span>
          </div>
        </div>
      </div>

      {/* Second Row: Daily Spending Timeline & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Spending Trend Area */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Biểu đồ biến động chi tiêu theo ngày</h3>
            <p className="text-xs text-slate-500">Phát hiện các ngày có chi phí đột biến trong tháng</p>
          </div>

          <div className="py-4">
            <DailyTrendChart transactions={transactions} selectedMonth={selectedMonth} />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Kênh thanh toán</h3>
            <p className="text-xs text-slate-500">Tỷ lệ chi tiêu qua các phương thức</p>
          </div>

          <div className="py-4 space-y-4">
            {[
              { label: 'Chuyển khoản / Thẻ ngân hàng', key: 'bank', amount: paymentTotals.bank, color: '#3B82F6' },
              { label: 'Ví điện tử (MoMo, ZaloPay...)', key: 'e_wallet', amount: paymentTotals.e_wallet, color: '#EC4899' },
              { label: 'Tiền mặt cầm tay', key: 'cash', amount: paymentTotals.cash, color: '#10B981' },
            ].map((pm) => {
              const pct = totalExpense > 0 ? (pm.amount / totalExpense) * 100 : 0;
              return (
                <div key={pm.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{pm.label}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatVND(pm.amount)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: pm.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Khuyến khích theo dõi qua thanh toán số để không sót hóa đơn
          </div>
        </div>
      </div>
    </div>
  );
};
