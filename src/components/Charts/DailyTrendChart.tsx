import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatVND, formatCompactVND } from '../../utils/formatters';

interface DailyTrendChartProps {
  transactions: Transaction[];
  selectedMonth: string; // "YYYY-MM"
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ transactions, selectedMonth }) => {
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number } | null>(null);

  // Determine number of days in the selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Aggregate daily expenses
  const dailyExpenses = new Array(daysInMonth).fill(0);
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.date.startsWith(selectedMonth)) {
      const day = parseInt(tx.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailyExpenses[day - 1] += tx.amount;
        totalExpense += tx.amount;
      }
    }
  });

  const averageDaily = totalExpense > 0 ? totalExpense / daysInMonth : 0;
  const maxDayAmount = Math.max(...dailyExpenses, 100000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 font-medium">Chi tiêu mỗi ngày trong tháng</span>
          <span className="ml-2 text-slate-400">· Trung bình: <strong className="text-slate-700 font-semibold tabular-nums">{formatCompactVND(averageDaily)}/ngày</strong></span>
        </div>
        {hoveredDay && (
          <div className="text-slate-800 font-semibold tabular-nums">
            Ngày {hoveredDay.day}/{month}: {formatVND(hoveredDay.amount)}
          </div>
        )}
      </div>

      <div className="relative pt-4 pb-2">
        {/* Daily bars */}
        <div className="flex items-end gap-1 h-36 border-b border-slate-200">
          {dailyExpenses.map((amount, idx) => {
            const dayNum = idx + 1;
            const heightPercent = (amount / maxDayAmount) * 100;
            const isAboveAverage = amount > averageDaily * 1.5;

            return (
              <div
                key={dayNum}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                onMouseEnter={() => setHoveredDay({ day: dayNum, amount })}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={`w-full rounded-t-xs transition-all duration-200 ${
                    amount === 0
                      ? 'bg-slate-100 hover:bg-slate-200 h-1'
                      : isAboveAverage
                      ? 'bg-rose-500 group-hover:bg-rose-600'
                      : 'bg-emerald-500 group-hover:bg-emerald-600'
                  }`}
                  style={{ height: amount === 0 ? '4px' : `${Math.max(heightPercent, 6)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Day numbers labels */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
          <span>01</span>
          <span>05</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
          <span>25</span>
          <span>{daysInMonth}</span>
        </div>
      </div>
    </div>
  );
};
