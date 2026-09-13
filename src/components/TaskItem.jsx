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
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Xóa công việc: "${task.title}"?`) && onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      className={`p-3.5 rounded-xl border transition-all duration-200 ${
        task.done 
          ? 'bg-emerald-950/10 border-emerald-500/20 shadow-sm' 
          : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox hoàn thành */}
        <button 
          onClick={() => onToggle(task)}
          className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
            task.done ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30' : 'border border-slate-600 bg-slate-950 hover:border-slate-500'
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
                  className="w-full bg-slate-950 border border-indigo-500 text-slate-100 text-sm rounded-lg px-2.5 py-1 outline-none"
                />
                <button 
                  onClick={handleSave}
                  className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-500 font-medium shrink-0"
                >
                  Lưu
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setEditedTitle(task.title); }}
                  className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-700 shrink-0"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <>
                <p 
                  onClick={() => onToggle(task)}
                  className={`text-sm font-medium cursor-pointer text-left flex-1 truncate ${
                    task.done ? 'text-slate-400' : 'text-slate-200'
                  }`}
                >
                  {task.title}
                </p>
                
                {/* Nút Sửa / Xóa tinh gọn */}
                <div className="flex items-center gap-0.5 opacity-80 hover:opacity-150 transition-opacity shrink-0">
                  <button 
                    onClick={() => { setIsEditing(true); setEditedTitle(task.title); }}
                    className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-md hover:bg-slate-800 text-xs transition"
                    title="Sửa"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800 text-xs transition"
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Khu vực chọn ngày bắt đầu & hoàn thành */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400">
            <div className="flex items-center justify-between bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/40">
              <span className="text-slate-500">Bắt đầu</span>
              <DatePicker
                selected={task.startDate}
                onChange={(date) => onDateChange(task.id, 'startDate', date)}
                dateFormat="dd/MM/yyyy"
                locale="vi"
                className="w-20 bg-transparent text-slate-300 text-right font-medium outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/40">
              <span className="text-slate-500">Hoàn thành</span>
              <DatePicker
                selected={task.endDate}
                onChange={(date) => onDateChange(task.id, 'endDate', date)}
                dateFormat="dd/MM/yyyy"
                locale="vi"
                placeholderText="Chọn ngày"
                className="w-20 bg-transparent text-emerald-400 text-right font-medium outline-none cursor-pointer placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}