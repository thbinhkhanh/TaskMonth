import React from 'react';
import DatePicker from 'react-datepicker';

export default function Header({ activeTab, selectedMonth, setSelectedMonth }) {
  return (
    <header className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex justify-between items-center z-10 shrink-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-indigo-400 flex items-center gap-1.5">
          <span>🎯</span> TaskMonth
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {activeTab === 'log' ? 'Tab Nhật ký' : 'Tab Thống kê'}
        </p>
      </div>
      
      <DatePicker
        selected={selectedMonth}
        onChange={(date) => setSelectedMonth(date)}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        locale="vi"
        className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs font-semibold text-indigo-300 text-center outline-none focus:border-indigo-500 cursor-pointer"
      />
    </header>
  );
}