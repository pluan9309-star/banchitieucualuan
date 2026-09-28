import React, { useState } from 'react';
import { Category, Transaction } from '../../types';
import { formatVND } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface CategoryDonutChartProps {
  transactions: Transaction[];
  categories: Category[];
  onSelectCategory?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  transactions,
  categories,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter only expenses
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryTotals = new Map<string, number>();
  expenseTransactions.forEach((t) => {
    categoryTotals.set(t.categoryId, (categoryTotals.get(t.categoryId) || 0) + t.amount);
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Sort by amount descending
  const sortedData = Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => {
      const cat = categoryMap.get(categoryId);
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: categoryId,
        name: cat?.name || 'Chưa phân loại',
        color: cat?.color || '#94A3B8',
        icon: cat?.icon || 'Tag',
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  if (totalExpense === 0 || sortedData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Chưa có dữ liệu chi tiêu trong tháng này</p>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 260;
  const strokeWidth = 34;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = sortedData.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;

    const isHovered = hoveredCategory === item.id;
    const isSelected = selectedCategoryId === item.id;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      isHovered,
      isSelected,
    };
  });

  const activeCategory =
    sortedData.find((d) => d.id === (hoveredCategory || selectedCategoryId)) || null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center transition-all duration-300"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={seg.isHovered || seg.isSelected ? strokeWidth + 6 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredCategory(seg.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(selectedCategoryId === seg.id ? null : seg.id);
                }
              }}
              style={{
                filter: seg.isHovered || seg.isSelected ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none',
              }}
            />
          ))}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeCategory ? (
            <>
              <span className="text-xs font-medium text-slate-500 line-clamp-1">{activeCategory.name}</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formatVND(activeCategory.amount)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 tabular-nums">
                {activeCategory.percentage.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-slate-500">Tổng chi tiêu</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatVND(totalExpense)}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                {sortedData.length} danh mục
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="w-full flex-1 space-y-2 max-h-72 overflow-y-auto pr-1">
        {sortedData.map((item) => {
          const isSelected = selectedCategoryId === item.id;
          const isHovered = hoveredCategory === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredCategory(item.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(selectedCategoryId === item.id ? null : item.id);
                }
              }}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-slate-100 border border-slate-300'
                  : isHovered
                  ? 'bg-slate-50'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="p-1 rounded bg-slate-100 text-slate-700 shrink-0">
                  <CategoryIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-800 truncate">{item.name}</span>
              </div>

              <div className="text-right shrink-0 pl-3">
                <div className="text-xs font-semibold text-slate-900 tabular-nums">
                  {formatVND(item.amount)}
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
