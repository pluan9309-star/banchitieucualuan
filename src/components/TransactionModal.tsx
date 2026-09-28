import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Transaction, TransactionType, Category, PaymentMethod, SavingsGoal } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatVND } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  categories: Category[];
  savingsGoals: SavingsGoal[];
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  savingsGoals,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [savingsGoalId, setSavingsGoalId] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
      setPaymentMethod(editingTransaction.paymentMethod);
      setSavingsGoalId(editingTransaction.savingsGoalId || '');
    } else {
      setType('expense');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat ? defaultCat.id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('bank');
      setSavingsGoalId(savingsGoals.length > 0 ? savingsGoals[0].id : '');
    }
  }, [editingTransaction, categories, savingsGoals, isOpen]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => {
    if (type === 'expense') return c.type === 'expense';
    if (type === 'income') return c.type === 'income';
    return true; // For savings_deposit, show salary or investment sources
  });

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleAddPreset = (value: number) => {
    const current = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    setAmount((current + value).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert('Vui lòng nhập số tiền lớn hơn 0');
      return;
    }
    if (!categoryId && type !== 'savings_deposit') {
      alert('Vui lòng chọn danh mục');
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        categoryId: categoryId || (type === 'savings_deposit' ? 'salary' : 'other_exp'),
        date,
        note: note.trim() || (type === 'savings_deposit' ? 'Tích luỹ tiết kiệm' : ''),
        paymentMethod,
        savingsGoalId: type === 'savings_deposit' ? savingsGoalId : undefined,
      },
      editingTransaction?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Ghi chép giao dịch mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const cat = categories.find((c) => c.type === 'expense');
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khoản Chi
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const cat = categories.find((c) => c.type === 'income');
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khoản Thu
            </button>
            <button
              type="button"
              onClick={() => {
                setType('savings_deposit');
                if (savingsGoals.length > 0) setSavingsGoalId(savingsGoals[0].id);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                type === 'savings_deposit'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nạp Tiết Kiệm
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="0"
                value={parsedAmount > 0 ? parsedAmount.toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAmount(val);
                }}
                className="w-full text-2xl font-bold text-slate-900 pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₫
              </span>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 200000, 500000, 1000000, 2000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddPreset(val)}
                  className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors tabular-nums"
                >
                  +{val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 rounded-md"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Savings Goal Selection (if type === 'savings_deposit') */}
          {type === 'savings_deposit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gửi vào mục tiêu tiết kiệm
              </label>
              {savingsGoals.length === 0 ? (
                <p className="text-xs text-amber-600">
                  Bạn chưa tạo mục tiêu tiết kiệm nào. Hãy chuyển sang tab "Mục tiêu tiết kiệm" để tạo!
                </p>
              ) : (
                <select
                  value={savingsGoalId}
                  onChange={(e) => setSavingsGoalId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  {savingsGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} (Hiện có: {formatVND(g.currentAmount)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Category Selection */}
          {type !== 'savings_deposit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Danh mục phân loại <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-md text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}20`,
                          color: isSelected ? '#FFFFFF' : cat.color,
                        }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày giao dịch</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phương thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="bank">Tài khoản Ngân hàng (CK)</option>
                <option value="e_wallet">Ví MoMo / ZaloPay / ShopeePay</option>
                <option value="cash">Tiền mặt</option>
              </select>
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú chi tiết (không bắt buộc)
            </label>
            <input
              type="text"
              placeholder="VD: Cơm trưa với đồng nghiệp, Mua sách tại Fahasa..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
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
              <span>{editingTransaction ? 'Lưu thay đổi' : 'Xác nhận ghi chép'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
