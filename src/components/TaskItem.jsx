import React from 'react';
import DatePicker from 'react-datepicker';

export default function TaskItem({ task, onToggle, onDateChange }) {
  return (
    <div 
      className={`p-3.5 rounded-2xl flex items-start space-x-3 transition ${
        task.done 
          ? 'bg-emerald-950/30 border border-emerald-500/30 shadow-sm' 
          : 'bg-slate-900 border border-slate-800 shadow-md'
      }`}
    >
      <button 
        onClick={() => onToggle(task)}
        className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
          task.done ? 'bg-emerald-500 text-slate-950' : 'border-2 border-slate-600 bg-slate-950'
        }`}
      >
        {task.done && '✓'}
      </button>
      
      <div className="flex-1 min-w-0">
        <p 
          onClick={() => onToggle(task)}
          className={`text-sm font-medium cursor-pointer truncate ${task.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}
        >
          {task.title}
        </p>
        
        <div className="flex flex-col gap-1.5 mt-2.5 text-[10px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>🚀 Bắt đầu:</span>
            <DatePicker
              selected={task.startDate}
              onChange={(date) => onDateChange(task.id, 'startDate', date)}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              className="w-24 bg-slate-800 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-center outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>🏁 Hoàn thành:</span>
            <DatePicker
              selected={task.endDate}
              onChange={(date) => onDateChange(task.id, 'endDate', date)}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              placeholderText="Chọn ngày"
              className="w-24 bg-slate-800 border border-slate-700 text-emerald-400 rounded px-1.5 py-0.5 text-center outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}