import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

export default function TaskItem({ task, onToggle, onDateChange, onDelete, onUpdateTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (editedTitle.trim() && onUpdateTitle) {
      onUpdateTitle(task.id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  // Hàm xử lý xóa có kèm bảng xác nhận cảnh báo
  const handleDeleteClick = () => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa công việc: "${task.title}" không?`);
    if (isConfirmed && onDelete) {
      onDelete(task.id);
    }
  };

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
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full bg-slate-800 border border-indigo-500 text-slate-200 text-sm rounded px-2 py-0.5 outline-none"
              />
              <button 
                onClick={handleSave}
                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-500 shrink-0 font-medium"
              >
                Lưu
              </button>
              <button 
                onClick={() => { setIsEditing(false); setEditedTitle(task.title); }}
                className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded hover:bg-slate-700 shrink-0"
              >
                Hủy
              </button>
            </div>
          ) : (
            <>
              <p 
                onClick={() => onToggle(task)}
                className={`text-sm font-medium cursor-pointer text-left flex-1 ${task.done ? 'text-slate-400' : 'text-slate-200'}`}
              >
                {task.title}
              </p>
              
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => { setIsEditing(true); setEditedTitle(task.title); }}
                  className="text-slate-400 hover:text-indigo-400 p-1 text-xs transition"
                  title="Sửa tên công việc"
                >
                  ✏️
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="text-slate-400 hover:text-rose-400 p-1 text-xs transition"
                  title="Xóa công việc"
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
        
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