import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

export default function TaskForm({ onAddTask }) {
  const [taskText, setTaskText] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    onAddTask({ title: taskText, startDate, endDate });

    setTaskText('');
    setStartDate(new Date());
    setEndDate(null);
  };

  return (
    <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800/80 p-3 z-10 space-y-2.5">
      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Bắt đầu:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="vi"
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-indigo-500 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Hoàn thành:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="vi"
            placeholderText="Chọn ngày"
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-indigo-500 cursor-pointer"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Nhập nội dung công việc..." 
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition shrink-0">
          Thêm
        </button>
      </div>
    </form>
  );
}