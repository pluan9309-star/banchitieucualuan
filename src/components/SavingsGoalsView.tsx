import React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  PiggyBank,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatVND, formatCompactVND, calculateDaysRemaining } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface SavingsGoalsViewProps {
  savingsGoals: SavingsGoal[];
  onOpenAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  savingsGoals,
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenDeposit,
}) => {
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalRemaining = Math.max(totalTarget - totalSaved, 0);
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mục Tiêu & Quỹ Tiết Kiệm</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập kế hoạch tích luỹ cho từng dự định: quỹ dự phòng, du lịch, mua sắm lớn và tương lai
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mục tiêu mới</span>
        </button>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Tổng tài sản đã tích luỹ</span>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            {formatVND(totalSaved)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="text-emerald-700 font-bold tabular-nums">{overallPercent.toFixed(1)}%</span>
            <span className="text-slate-500">tiến độ tổng thể</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Tổng giá trị mục tiêu</span>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            {formatVND(totalTarget)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gồm {savingsGoals.length} mục tiêu độc lập</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Cần tích luỹ thêm</span>
          <div className="text-2xl font-bold text-sky-700 mt-1.5 tabular-nums">
            {formatVND(totalRemaining)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Để hoàn thành 100% tất cả mục tiêu</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Mục tiêu đã hoàn thành</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1.5 tabular-nums">
            {savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length} / {savingsGoals.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Đạt 100% số tiền mục tiêu</p>
        </div>
      </div>

      {/* Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isFinished = goal.currentAmount >= goal.targetAmount;
          const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
          const daysLeft = calculateDaysRemaining(goal.targetDate);
          const monthsLeft = Math.max(Math.ceil(daysLeft / 30), 1);
          const monthlyPace = remainingAmount > 0 ? remainingAmount / monthsLeft : 0;

          return (
            <div
              key={goal.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${goal.color}15`,
                        color: goal.color,
                      }}
                    >
                      <CategoryIcon name={goal.icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{goal.title}</h3>
                        {isFinished && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>{goal.categoryTag}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 tabular-nums">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Hạn: {goal.targetDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Sửa mục tiêu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xoá mục tiêu "${goal.title}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Xoá mục tiêu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note if any */}
                {goal.note && (
                  <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    "{goal.note}"
                  </p>
                )}

                {/* Amounts & Progress */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Đã tích luỹ</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {formatVND(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Mục tiêu</span>
                    <span className="text-base font-semibold text-slate-700 tabular-nums">
                      {formatVND(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar with milestones */}
                <div className="mt-3 space-y-1.5">
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  {/* Milestones markers */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5 tabular-nums">
                    <span className={percent >= 25 ? 'font-bold text-slate-700' : ''}>25%</span>
                    <span className={percent >= 50 ? 'font-bold text-slate-700' : ''}>50%</span>
                    <span className={percent >= 75 ? 'font-bold text-slate-700' : ''}>75%</span>
                    <span className={percent >= 100 ? 'font-bold text-emerald-600' : ''}>100%</span>
                  </div>
                </div>

                {/* Time & Monthly Recommended Pace */}
                <div className="mt-4 p-3 bg-slate-50/70 border border-slate-200/70 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {daysLeft > 0 ? (
                        <>Còn <strong className="text-slate-900 tabular-nums">{daysLeft}</strong> ngày (~{monthsLeft} tháng)</>
                      ) : (
                        <span className="text-rose-600 font-semibold">Đã đến hạn chót</span>
                      )}
                    </span>
                  </div>

                  <div className="text-right tabular-nums">
                    {remainingAmount > 0 ? (
                      <span className="text-slate-700 font-medium">
                        Cần góp: <strong className="text-emerald-700 font-bold">{formatCompactVND(monthlyPace)}/tháng</strong>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold">Hoàn thành xuất sắc! 🎉</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Nạp tiền / Rút tiền */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onOpenDeposit(goal)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Nạp tiền vào quỹ</span>
                </button>
                <button
                  onClick={() => onOpenDeposit(goal)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Rút bớt tiền khỏi quỹ"
                >
                  Rút bớt
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
