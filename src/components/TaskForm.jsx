import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTheme } from '../App';

export default function TaskForm({ onAddTask, selectedMonth }) {
  const { isDarkMode } = useTheme();
  
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Format ngày sang chuỗi DD-MM-YYYY
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    onAddTask({
      title,
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
      dueDate: '',
      createdAt: selectedMonth
    });

    setTitle('');
    setFromDate(null);
    setToDate(null);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`absolute bottom-0 left-0 right-0 p-4 border-t shadow-lg transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* 2 cột thời gian (Từ ngày, Đến ngày) */}
      <div className="grid grid-cols-2 gap-2 mb-2.5 text-xs">
        <div>
          <label className={`block mb-1 font-medium text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Từ ngày:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="vi"
            placeholderText="Chọn ngày"
            className={`w-full p-2 rounded-lg border text-center text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600' 
                : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        <div>
          <label className={`block mb-1 font-medium text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Đến ngày:</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="vi"
            placeholderText="Chọn ngày"
            className={`w-full p-2 rounded-lg border text-center text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600' 
                : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Ô nhập tên công việc tự động co giãn xuống dòng */}
      <div className="flex gap-2 items-end">
        <textarea 
          rows="2"
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập nội dung công việc (cho phép xuống dòng)..."
          className={`flex-1 p-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDarkMode 
              ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500' 
              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
          }`}
        />
        <button 
          type="submit"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md transition-all h-[42px] flex items-center justify-center shrink-0"
        >
          Thêm
        </button>
      </div>
    </form>
  );
}