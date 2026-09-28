import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatVND } from '../utils/formatters';

interface SavingsDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onConfirm: (goalId: string, deltaAmount: number, action: 'deposit' | 'withdraw', note: string) => void;
}

export const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  onConfirm,
}) => {
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen || !goal) return null;

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (action === 'withdraw' && parsedAmount > goal.currentAmount) {
      alert(`Số tiền rút không được vượt quá số dư hiện có (${formatVND(goal.currentAmount)})`);
      return;
    }

    onConfirm(
      goal.id,
      action === 'deposit' ? parsedAmount : -parsedAmount,
      action,
      note.trim() || (action === 'deposit' ? `Nạp tích lũy vào quỹ: ${goal.title}` : `Rút tiền từ quỹ: ${goal.title}`)
    );
    onClose();
    setAmount('');
    setNote('');
  };

  const remainingNeeded = Math.max(goal.targetAmount - goal.currentAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {action === 'deposit' ? 'Nạp tiền vào quỹ' : 'Rút tiền từ quỹ'}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{goal.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAction('deposit')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                action === 'deposit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Nạp thêm tiền</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('withdraw')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                action === 'withdraw'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Rút bớt tiền</span>
            </button>
          </div>

          {/* Current balance reminder */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-500">Số dư hiện tại:</span>
            <span className="font-bold text-slate-900 tabular-nums">{formatVND(goal.currentAmount)}</span>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền {action === 'deposit' ? 'nạp' : 'rút'} (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={parsedAmount > 0 ? parsedAmount.toLocaleString('vi-VN') : ''}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="1.000.000"
                className="w-full text-xl font-bold text-slate-900 pl-4 pr-12 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₫
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500000, 1000000, 2000000, 5000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const curr = parseInt(amount.replace(/\D/g, ''), 10) || 0;
                    setAmount((curr + val).toString());
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors tabular-nums"
                >
                  +{val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                </button>
              ))}
              {action === 'deposit' && remainingNeeded > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(remainingNeeded.toString())}
                  className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                >
                  Nạp đủ mục tiêu
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú giao dịch</label>
            <input
              type="text"
              placeholder={action === 'deposit' ? 'VD: Trích lương thưởng dự án' : 'VD: Dùng cho đợt thanh toán vé máy bay'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
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
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
                action === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận {action === 'deposit' ? 'nạp tiền' : 'rút tiền'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
