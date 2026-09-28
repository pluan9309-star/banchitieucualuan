import React from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { Budget, Category, Transaction } from '../types';
import { formatVND, formatCompactVND } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  selectedMonth: string;
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  selectedMonth,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const totalMonthlyIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

  // Calculate spent per budget category
  const budgetStats = budgets.map((b) => {
    const cat = categoryMap.get(b.categoryId);
    const spent = monthTransactions
      .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const remaining = b.monthlyLimit - spent;
    const isExceeded = spent >= b.monthlyLimit;
    const isWarning = !isExceeded && spent >= b.monthlyLimit * (b.alertThreshold || 0.8);

    return {
      budget: b,
      category: cat,
      spent,
      limit: b.monthlyLimit,
      remaining,
      percent,
      isExceeded,
      isWarning,
    };
  });

  const totalSpentInBudgets = budgetStats.reduce((sum, b) => sum + b.spent, 0);
  const overallBudgetPercent = totalBudgetLimit > 0 ? (totalSpentInBudgets / totalBudgetLimit) * 100 : 0;

  // 50/30/20 Rule Calculations
  const needsCategories = ['food', 'housing', 'transport', 'health'];
  const wantsCategories = ['shopping', 'entertainment', 'other_exp'];

  const spentOnNeeds = monthTransactions
    .filter((t) => t.type === 'expense' && needsCategories.includes(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);

  const spentOnWants = monthTransactions
    .filter((t) => t.type === 'expense' && wantsCategories.includes(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);

  const spentOnSavings = monthTransactions
    .filter((t) => t.type === 'savings_deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const idealIncome = totalMonthlyIncome > 0 ? totalMonthlyIncome : 30000000;
  const ideal50 = idealIncome * 0.5;
  const ideal30 = idealIncome * 0.3;
  const ideal20 = idealIncome * 0.2;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quản Lý Ngân Sách Theo Khoản Chi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm soát chi tiêu, ngăn ngừa bội chi với hạn mức định lượng rõ ràng cho từng danh mục
          </p>
        </div>

        <button
          onClick={onOpenAddBudget}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt ngân sách mới</span>
        </button>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Tổng hạn mức ngân sách tháng</span>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            {formatVND(totalBudgetLimit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Áp dụng cho {budgets.length} danh mục chi tiêu</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Đã chi tiêu trong ngân sách</span>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            {formatVND(totalSpentInBudgets)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="text-slate-500">Đã dùng:</span>
            <span className="font-semibold text-slate-800 tabular-nums">{overallBudgetPercent.toFixed(0)}%</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-600 font-medium tabular-nums">Còn lại {formatCompactVND(Math.max(totalBudgetLimit - totalSpentInBudgets, 0))}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Tình trạng kiểm soát chi tiêu</span>
          <div className="mt-2 flex items-center gap-2">
            {overallBudgetPercent <= 85 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-emerald-800">Đang chi tiêu kỷ luật</span>
              </>
            ) : overallBudgetPercent < 100 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm font-bold text-amber-800">Cần thắt chặt chi tiêu</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-sm font-bold text-rose-800">Đã vượt tổng ngân sách</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cập nhật theo thời gian thực tháng {selectedMonth}</p>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetStats.map(({ budget, category, spent, limit, remaining, percent, isExceeded, isWarning }) => {
          return (
            <div
              key={budget.id}
              className={`bg-white p-5 rounded-xl border transition-all shadow-xs flex flex-col justify-between ${
                isExceeded
                  ? 'border-rose-300 bg-rose-50/20'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top: Category info + Actions */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${category?.color || '#94A3B8'}20`,
                        color: category?.color || '#64748B',
                      }}
                    >
                      <CategoryIcon name={category?.icon || 'Tag'} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {category?.name || 'Danh mục'}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {category?.description || 'Hạn mức chi tiêu mỗi tháng'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditBudget(budget)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Sửa hạn mức"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xoá hạn mức ngân sách này?')) {
                          onDeleteBudget(budget.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Xoá ngân sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts & Percent */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Đã chi tiêu</span>
                    <span className={`text-lg font-bold tabular-nums ${isExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatVND(spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Hạn mức tối đa</span>
                    <span className="text-sm font-semibold text-slate-700 tabular-nums">
                      {formatVND(limit)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span
                      className={`font-semibold tabular-nums ${
                        isExceeded
                          ? 'text-rose-600'
                          : isWarning
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {percent.toFixed(1)}% ngân sách
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {remaining >= 0 ? `Còn lại ${formatVND(remaining)}` : `Vượt trần ${formatVND(Math.abs(remaining))}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill-free footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Cảnh báo ở mức {(budget.alertThreshold * 100).toFixed(0)}%</span>
                <span
                  className={`font-medium ${
                    isExceeded
                      ? 'text-rose-600'
                      : isWarning
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {isExceeded ? 'Đã quá hạn mức' : isWarning ? 'Gần chạm trần' : 'Trong tầm kiểm soát'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Financial Guide: Quy tắc 50/30/20 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Khuyến Nghị Kế Hoạch Tài Chính Chuẩn (Quy Tắc 50/30/20)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Dựa trên thu nhập tháng này ({formatVND(idealIncome)}), dưới đây là tỷ lệ phân bổ ngân sách lý tưởng giúp bạn vừa thoải mái sinh hoạt vừa duy trì tài sản tăng trưởng:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 50% Needs */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">50% Nhu Cầu Thiết Yếu</span>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">{formatVND(ideal50)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Ăn uống, thuê nhà, điện nước, internet, xăng xe, bảo hiểm y tế.
            </p>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600">Thực tế đã chi:</span>
              <span className="font-bold text-slate-900 tabular-nums">{formatVND(spentOnNeeds)}</span>
            </div>
          </div>

          {/* 30% Wants */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">30% Sở Thích & Mong Muốn</span>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">{formatVND(ideal30)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mua sắm quần áo, ăn ngoài giải trí, xem phim, cà phê bạn bè, du lịch.
            </p>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600">Thực tế đã chi:</span>
              <span className="font-bold text-slate-900 tabular-nums">{formatVND(spentOnWants)}</span>
            </div>
          </div>

          {/* 20% Savings */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">20% Tiết Kiệm & Tích Lũy</span>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">{formatVND(ideal20)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Quỹ dự phòng khẩn cấp, mua sắm tài sản lớn, tích lũy đầu tư chứng chỉ quỹ.
            </p>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600">Thực tế đã nạp quỹ:</span>
              <span className="font-bold text-sky-700 tabular-nums">{formatVND(spentOnSavings)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
