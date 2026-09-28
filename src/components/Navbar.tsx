import React from 'react';
import { Plus, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddTransaction: () => void;
  onResetData: () => void;
  selectedMonth: string; // e.g. "2026-09"
  setSelectedMonth: (month: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTransaction,
  onResetData,
  selectedMonth,
  setSelectedMonth,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'transactions', label: 'Sổ giao dịch' },
    { id: 'analytics', label: 'Biểu đồ phân tích' },
    { id: 'budgets', label: 'Ngân sách' },
    { id: 'savings', label: 'Mục tiêu tiết kiệm' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              ₫
            </div>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('overview');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors"
            >
              FinTrack VN
            </a>
          </div>

          {/* Zone 2: Navigation Links (Text with subtle active indicator) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick month selector */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer tabular-nums"
              title="Chọn tháng thống kê"
            />

            {/* Quick Reset to Sample */}
            <button
              onClick={() => {
                if (window.confirm('Khôi phục dữ liệu mẫu chuẩn (hơn 15 giao dịch và kế hoạch mẫu)?')) {
                  onResetData();
                }
              }}
              title="Khôi phục dữ liệu mẫu"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Primary CTA: Add Transaction */}
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-98 transition-all shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi chép mới</span>
            </button>

            {/* User profile avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <img
                src="/src/assets/images/user_avatar_1790563375238.jpg"
                alt="Avatar Tuấn Anh"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Mobile secondary nav bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
