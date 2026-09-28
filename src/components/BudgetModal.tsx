import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Budget, Category } from '../types';
import { formatVND } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>, editingId?: string) => void;
  categories: Category[];
  existingBudgets: Budget[];
  editingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  existingBudgets,
  editingBudget,
}) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0.8);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setLimit(editingBudget.monthlyLimit.toString());
      setThreshold(editingBudget.alertThreshold || 0.8);
    } else {
      // Find first category not yet budgeted
      const usedCategoryIds = new Set(existingBudgets.map((b) => b.categoryId));
      const available = expenseCategories.find((c) => !usedCategoryIds.has(c.id));
      setCategoryId(available ? available.id : expenseCategories[0]?.id || '');
      setLimit('2000000');
      setThreshold(0.8);
    }
  }, [editingBudget, existingBudgets, isOpen]);

  if (!isOpen) return null;

  const parsedLimit = parseInt(limit.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedLimit <= 0) {
      alert('Vui lòng nhập định mức ngân sách lớn hơn 0');
      return;
    }
    if (!categoryId) {
      alert('Vui lòng chọn danh mục áp dụng ngân sách');
      return;
    }

    onSave(
      {
        categoryId,
        monthlyLimit: parsedLimit,
        period: 'monthly',
        alertThreshold: threshold,
      },
      editingBudget?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {editingBudget ? 'Chỉnh sửa ngân sách danh mục' : 'Thiết lập hạn mức ngân sách mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Danh mục chi tiêu <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={Boolean(editingBudget)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hạn mức chi tiêu tối đa mỗi tháng (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={parsedLimit > 0 ? parsedLimit.toLocaleString('vi-VN') : ''}
                onChange={(e) => setLimit(e.target.value.replace(/\D/g, ''))}
                placeholder="2.000.000"
                className="w-full text-xl font-bold text-slate-900 pl-4 pr-12 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₫/tháng
              </span>
            </div>
            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[1000000, 2000000, 3000000, 5000000, 10000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLimit(val.toString())}
                  className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors tabular-nums"
                >
                  {val >= 1000000 ? `${val / 1000000} triệu` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngưỡng cảnh báo khi chi chạm mốc: <span className="text-amber-600 font-bold tabular-nums">{(threshold * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 tabular-nums">
              <span>50% (Cảnh báo sớm)</span>
              <span>80% (Khuyến nghị)</span>
              <span>100% (Khi vừa chạm trần)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{editingBudget ? 'Lưu thay đổi' : 'Áp dụng ngân sách'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
