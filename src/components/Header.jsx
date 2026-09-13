import React from 'react';
import DatePicker from 'react-datepicker';

export default function Header({ activeTab, selectedMonth, setSelectedMonth }) {
  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-5 py-4 flex justify-between items-center z-10 shrink-0">
      <div>
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-indigo-400 text-lg">🎯</span> 
          <span>TaskMonth</span>
        </h1>
      </div>
      
      <DatePicker
        selected={selectedMonth}
        onChange={(date) => setSelectedMonth(date)}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        locale="vi"
        wrapperClassName="w-28 sm:w-auto"
        className="w-full bg-slate-900/90 border border-slate-700/70 hover:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-300 text-center outline-none transition cursor-pointer shadow-sm"
      />
    </header>
  );
}