import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, Category, PaymentMethod } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { exportTransactionsAsCSV } from '../data/storage';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  selectedMonth,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'savings_deposit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [monthScope, setMonthScope] = useState<'current_month' | 'all_time'>('current_month');

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Filter pipeline
  const filtered = transactions.filter((t) => {
    // Month scope
    if (monthScope === 'current_month' && !t.date.startsWith(selectedMonth)) {
      return false;
    }
    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) {
      return false;
    }
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const cat = categoryMap.get(t.categoryId);
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchCat = cat?.name.toLowerCase().includes(q);
      if (!matchNote && !matchCat) return false;
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
    }
    if (sortBy === 'date_asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
    }
    if (sortBy === 'amount_desc') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount_asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Aggregate stats for filtered view
  const filteredIncome = sorted.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const filteredExpense = sorted.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const filteredSavings = sorted.filter((t) => t.type === 'savings_deposit').reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const csvContent = exportTransactionsAsCSV(sorted, categories);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `so-thu-chi-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sổ Nhật Ký Giao Dịch</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý, tìm kiếm và xuất báo cáo toàn bộ các khoản thu chi & tích luỹ
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo ghi chú, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Month Scope */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setMonthScope('current_month')}
              className={`flex-1 py-1 text-center font-medium rounded-md transition-colors ${
                monthScope === 'current_month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng {selectedMonth.split('-')[1]}
            </button>
            <button
              onClick={() => setMonthScope('all_time')}
              className={`flex-1 py-1 text-center font-medium rounded-md transition-colors ${
                monthScope === 'all_time'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả thời gian
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type === 'expense' ? '🔴' : '🟢'} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="date_desc">Ngày: Mới nhất trước</option>
              <option value="date_asc">Ngày: Cũ nhất trước</option>
              <option value="amount_desc">Số tiền: Lớn nhất trước</option>
              <option value="amount_asc">Số tiền: Nhỏ nhất trước</option>
            </select>
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1">Loại:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'expense', label: 'Khoản chi' },
              { id: 'income', label: 'Khoản thu' },
              { id: 'savings_deposit', label: 'Gửi tiết kiệm' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setTypeFilter(btn.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  typeFilter === btn.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Filtered stats summary */}
          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="text-slate-500">
              Tìm thấy <strong className="text-slate-900">{sorted.length}</strong> giao dịch
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold">Thu: +{formatVND(filteredIncome)}</span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span className="text-rose-700 font-semibold">Chi: -{formatVND(filteredExpense)}</span>
          </div>
        </div>
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ngày ghi</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Ghi chú & Chi tiết</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4 text-right">Số tiền (VNĐ)</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 tabular-nums">
                        {formatDateVN(tx.date)}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${cat?.color || '#94A3B8'}15`,
                              color: cat?.color || '#64748B',
                            }}
                          >
                            <CategoryIcon name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-900">{cat?.name || 'Khác'}</span>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {tx.note || <span className="text-slate-300 italic">Không có ghi chú</span>}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {tx.paymentMethod === 'bank'
                          ? 'Chuyển khoản'
                          : tx.paymentMethod === 'e_wallet'
                          ? 'Ví điện tử'
                          : 'Tiền mặt'}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-bold tabular-nums">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600'
                              : isExpense
                              ? 'text-rose-600'
                              : 'text-sky-600'
                          }
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatVND(tx.amount)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Sửa giao dịch"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xoá giao dịch này?')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Xoá giao dịch"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
