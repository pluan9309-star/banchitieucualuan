import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatVND, formatCompactVND } from '../../utils/formatters';

interface MonthlyBarChartProps {
  transactions: Transaction[];
  selectedMonth: string; // "YYYY-MM"
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ transactions, selectedMonth }) => {
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  // Divide month into 4 weeks
  // Week 1: Day 1-7
  // Week 2: Day 8-14
  // Week 3: Day 15-21
  // Week 4: Day 22-end
  const weeks = [
    { label: 'Tuần 1 (01-07)', days: [1, 7], income: 0, expense: 0, savings: 0 },
    { label: 'Tuần 2 (08-14)', days: [8, 14], income: 0, expense: 0, savings: 0 },
    { label: 'Tuần 3 (15-21)', days: [15, 21], income: 0, expense: 0, savings: 0 },
    { label: 'Tuần 4 (22+)', days: [22, 31], income: 0, expense: 0, savings: 0 },
  ];

  transactions.forEach((tx) => {
    if (!tx.date.startsWith(selectedMonth)) return;
    const day = parseInt(tx.date.split('-')[2], 10);

    let weekIdx = 0;
    if (day <= 7) weekIdx = 0;
    else if (day <= 14) weekIdx = 1;
    else if (day <= 21) weekIdx = 2;
    else weekIdx = 3;

    if (tx.type === 'income') {
      weeks[weekIdx].income += tx.amount;
    } else if (tx.type === 'expense') {
      weeks[weekIdx].expense += tx.amount;
    } else if (tx.type === 'savings_deposit') {
      weeks[weekIdx].savings += tx.amount;
    }
  });

  const maxVal = Math.max(
    ...weeks.map((w) => Math.max(w.income, w.expense + w.savings)),
    1000000
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">Dòng tiền theo tuần trong tháng</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="text-slate-600">Thu nhập</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span className="text-slate-600">Chi tiêu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
            <span className="text-slate-600">Tiết kiệm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 pt-6 pb-2 border-b border-slate-100 min-h-[220px] items-end">
        {weeks.map((week, idx) => {
          const incHeight = (week.income / maxVal) * 100;
          const expHeight = (week.expense / maxVal) * 100;
          const savHeight = (week.savings / maxVal) * 100;
          const isHovered = activeWeek === idx;

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onMouseEnter={() => setActiveWeek(idx)}
              onMouseLeave={() => setActiveWeek(null)}
            >
              {/* Tooltip on hover */}
              <div
                className={`text-[11px] font-medium text-slate-700 tabular-nums transition-opacity duration-150 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                + {formatCompactVND(week.income - week.expense)}
              </div>

              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1.5 h-40 max-w-[72px]">
                {/* Income Bar */}
                <div
                  className="w-1/2 bg-emerald-500 rounded-t-md transition-all duration-300 hover:brightness-110 relative"
                  style={{ height: `${Math.max(incHeight, 4)}%` }}
                  title={`Thu nhập: ${formatVND(week.income)}`}
                />

                {/* Expense & Savings stacked or side-by-side */}
                <div className="w-1/2 flex flex-col justify-end h-full gap-0.5">
                  {week.savings > 0 && (
                    <div
                      className="w-full bg-sky-500 rounded-t-xs transition-all duration-300"
                      style={{ height: `${Math.max(savHeight, 3)}%` }}
                      title={`Tích luỹ: ${formatVND(week.savings)}`}
                    />
                  )}
                  <div
                    className="w-full bg-rose-500 rounded-t-xs transition-all duration-300 hover:brightness-110"
                    style={{ height: `${Math.max(expHeight, 4)}%` }}
                    title={`Chi tiêu: ${formatVND(week.expense)}`}
                  />
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <span className="block text-xs font-semibold text-slate-800">
                  T{idx + 1}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {week.days[0]}-{week.days[1]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Details when selected */}
      {activeWeek !== null && (
        <div className="p-3 bg-slate-50 rounded-lg text-xs flex items-center justify-between border border-slate-200">
          <span className="font-semibold text-slate-800">{weeks[activeWeek].label}:</span>
          <div className="flex items-center gap-4 tabular-nums">
            <span className="text-emerald-700">Thu: {formatVND(weeks[activeWeek].income)}</span>
            <span className="text-rose-700">Chi: {formatVND(weeks[activeWeek].expense)}</span>
            <span className="text-sky-700">Tiết kiệm: {formatVND(weeks[activeWeek].savings)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
