import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTheme } from '../App';

// Danh sách gợi ý nội dung chi tiêu phổ biến
const SUGGESTED_EXPENSES = [
  'Ăn uống', 'Cà phê', 'Xăng xe', 'Điện nước', 'Internet', 'Mua sắm', 'Hiếu hỉ'
];

export default function ExpenseForm({ onAddExpense }) {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    onAddExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      date: date.toISOString(),
    });

    setTitle('');
    setAmount('');
    setDate(new Date());
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`absolute bottom-0 left-0 right-0 p-4 border-t shadow-lg transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Gợi ý nhanh danh sách chi tiêu */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {SUGGESTED_EXPENSES.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setTitle(item)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Nhập nội dung và số tiền */}
      <div className="flex gap-2 mb-2">
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nội dung chi tiêu..."
          className={`flex-1 p-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDarkMode 
              ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500' 
              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
          }`}
        />
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Số tiền (đ)..."
          className={`w-32 p-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold ${
            isDarkMode 
              ? 'bg-slate-950 border-slate-700 text-emerald-400 placeholder-slate-500' 
              : 'bg-slate-50 border-slate-300 text-emerald-600 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Chọn ngày và nút Thêm */}
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1.5 flex-1">
          <label className={`font-medium text-[11px] shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Ngày chi:</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="dd/MM/yyyy"
            locale="vi"
            className={`w-28 p-1.5 rounded-lg border text-center text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          />
        </div>

        <button 
          type="submit"
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          Thêm khoản chi
        </button>
      </div>
    </form>
  );
}