import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SavingsGoal } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>, editingId?: string) => void;
  editingGoal?: SavingsGoal | null;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [categoryTag, setCategoryTag] = useState('Dự phòng an toàn');
  const [color, setColor] = useState('#0284C7');
  const [icon, setIcon] = useState('ShieldCheck');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setTargetDate(editingGoal.targetDate);
      setCategoryTag(editingGoal.categoryTag);
      setColor(editingGoal.color);
      setIcon(editingGoal.icon);
      setNote(editingGoal.note);
    } else {
      setTitle('');
      setTargetAmount('30000000');
      setCurrentAmount('5000000');
      // default 6 months in future
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setCategoryTag('Dự phòng an toàn');
      setColor('#0284C7');
      setIcon('ShieldCheck');
      setNote('');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const parsedTarget = parseInt(targetAmount.replace(/\D/g, ''), 10) || 0;
  const parsedCurrent = parseInt(currentAmount.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên mục tiêu tiết kiệm');
      return;
    }
    if (parsedTarget <= 0) {
      alert('Vui lòng nhập số tiền mục tiêu lớn hơn 0');
      return;
    }
    if (!targetDate) {
      alert('Vui lòng chọn ngày dự kiến hoàn thành');
      return;
    }

    onSave(
      {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        categoryTag,
        color,
        icon,
        note: note.trim(),
      },
      editingGoal?.id
    );
    onClose();
  };

  const colorOptions = [
    '#0284C7', // Sky
    '#059669', // Emerald
    '#E11D48', // Rose
    '#7C3AED', // Violet
    '#D97706', // Amber
    '#2563EB', // Blue
  ];

  const iconOptions = ['ShieldCheck', 'Plane', 'Laptop', 'TrendingUp', 'Home', 'PiggyBank'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {editingGoal ? 'Chỉnh sửa mục tiêu tiết kiệm' : 'Tạo mục tiêu tiết kiệm mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên mục tiêu / Quỹ tiết kiệm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Quỹ khẩn cấp 6 tháng, Mua xe mới, Du lịch Đà Lạt..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tiền mục tiêu cần đạt (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={parsedTarget > 0 ? parsedTarget.toLocaleString('vi-VN') : ''}
                onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="50.000.000"
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tiền hiện đã có sẵn (VNĐ)
              </label>
              <input
                type="text"
                value={parsedCurrent > 0 ? parsedCurrent.toLocaleString('vi-VN') : '0'}
                onChange={(e) => setCurrentAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Date & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn chót hoàn thành <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại quỹ</label>
              <select
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Dự phòng an toàn">Dự phòng an toàn</option>
                <option value="Du lịch & Trải nghiệm">Du lịch & Trải nghiệm</option>
                <option value="Mua sắm lớn">Mua sắm thiết bị / Tài sản</option>
                <option value="Đầu tư tài chính">Đầu tư & Tích lũy</option>
                <option value="Học tập & Sự nghiệp">Học tập & Sự nghiệp</option>
                <option value="Khác">Mục tiêu khác</option>
              </select>
            </div>
          </div>

          {/* Icon & Color selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Biểu tượng</label>
              <div className="flex items-center gap-2">
                {iconOptions.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      icon === ic
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Màu chủ đạo</label>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú động lực</label>
            <textarea
              rows={2}
              placeholder="VD: Không được rút quỹ này trừ khi có việc khẩn cấp thật sự..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Submit */}
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
              <span>{editingGoal ? 'Lưu cập nhật' : 'Khởi tạo mục tiêu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
