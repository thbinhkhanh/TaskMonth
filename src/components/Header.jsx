import React from 'react';
import DatePicker from 'react-datepicker';

export default function Header({ selectedMonth, setSelectedMonth, isDarkMode, toggleTheme }) {
  return (
    <header className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex justify-between items-center z-10 shrink-0">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
          <span>🎯</span> TaskMonth
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <DatePicker
          selected={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          locale="vi"
          className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs font-semibold text-white text-center outline-none focus:border-indigo-500 cursor-pointer"
        />
        
        {/* Nút Chế độ Tối/Sáng */}
        <button
          onClick={toggleTheme}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-center cursor-pointer"
          title="Chuyển đổi chế độ Sáng/Tối"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}