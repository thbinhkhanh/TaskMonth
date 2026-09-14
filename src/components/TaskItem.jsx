import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTheme } from '../App';

export default function TaskItem({ task, onToggle, onDateChange, onDelete, onUpdateTitle }) {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title || '');

  // State tạm thời để lưu ngày tháng khi đang ở chế độ chỉnh sửa
  const [editedFromDate, setEditedFromDate] = useState(task.fromDate || task.startDate || task.from || task.start || '');
  const [editedToDate, setEditedToDate] = useState(task.toDate || task.end || task.to || '');
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || task.endDate || task.date || task.completeDate || task.completedDate || '');

  const parseDateValue = (val) => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val.toDate === 'function') {
      const tsDate = val.toDate();
      return isNaN(tsDate.getTime()) ? null : tsDate;
    }
    
    if (typeof val === 'string') {
      const cleanVal = val.trim();
      if (!cleanVal) return null;

      const datePart = cleanVal.split(' ')[0];
      const parts = datePart.split(/[-/]/);

      if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const d = new Date(year, month, day);
          return isNaN(d.getTime()) ? null : d;
        }
        if (parts[0].length === 4) {
          const d = new Date(datePart);
          return isNaN(d.getTime()) ? null : d;
        }
      }

      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const formatDateToString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSave = () => {
    // 1. Lưu tiêu đề nếu có thay đổi
    if (editedTitle.trim() && onUpdateTitle) {
      onUpdateTitle(task.id, editedTitle.trim());
    }
    // 2. Lưu thông tin ngày tháng cho cả 3 trường
    if (onDateChange) {
      onDateChange(task.id, 'fromDate', editedFromDate);
      onDateChange(task.id, 'toDate', editedToDate);
      onDateChange(task.id, 'dueDate', editedDueDate);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
    setEditedFromDate(task.fromDate || task.startDate || task.from || task.start || '');
    setEditedToDate(task.toDate || task.end || task.to || '');
    setEditedDueDate(task.dueDate || task.endDate || task.date || task.completeDate || task.completedDate || '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDeleteClick = () => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa công việc: "${task.title}" không?`);
    if (isConfirmed && onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      className={`p-3.5 rounded-2xl flex items-start space-x-3 transition-all border ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 shadow-md' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <button 
        onClick={() => onToggle(task)}
        className={`w-5 h-5 mt-1 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
          task.done || task.completed 
            ? 'bg-blue-500 text-white' 
            : isDarkMode ? 'border-2 border-slate-600 bg-slate-950 text-transparent' : 'border-2 border-slate-400 bg-white text-transparent'
        }`}
      >
        {(task.done || task.completed) && '✓'}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <div className="flex flex-col gap-2 flex-1">
              <textarea
                rows="2"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className={`w-full border text-sm rounded-xl p-2 outline-none resize-none ${
                  isDarkMode 
                    ? 'bg-slate-800 border-indigo-500 text-slate-200' 
                    : 'bg-slate-50 border-indigo-500 text-slate-900'
                }`}
              />
            </div>
          ) : (
            <>
              <div 
                onClick={() => onToggle(task)}
                className={`text-sm font-medium cursor-pointer text-left flex-1 break-words whitespace-pre-wrap leading-relaxed ${
                  task.done || task.completed 
                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-600 font-semibold') 
                    : isDarkMode ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                {task.title}
              </div>
              
              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`p-1 text-xs transition ${isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}
                  title="Sửa công việc và ngày tháng"
                >
                  ✏️
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="text-slate-400 hover:text-rose-500 p-1 text-xs transition"
                  title="Xóa công việc"
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* 3 cột thời gian */}
        <div className={`grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t text-[11px] ${
          isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          {/* Từ ngày */}
          <div className={`p-1.5 rounded-lg text-center flex flex-col items-center ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            <span className="block text-[10px] opacity-70 mb-1">Từ ngày</span>
            <DatePicker
              selected={parseDateValue(isEditing ? editedFromDate : (task.fromDate || task.startDate || task.from || task.start))}
              onChange={(date) => setEditedFromDate(formatDateToString(date))}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              placeholderText="---"
              disabled={!isEditing}
              className={`w-full bg-transparent text-center font-semibold outline-none ${
                isEditing ? 'cursor-pointer border-b border-indigo-500' : 'cursor-default'
              } ${isDarkMode ? 'text-slate-200 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
            />
          </div>

          {/* Đến ngày */}
          <div className={`p-1.5 rounded-lg text-center flex flex-col items-center ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            <span className="block text-[10px] opacity-70 mb-1">Đến ngày</span>
            <DatePicker
              selected={parseDateValue(isEditing ? editedToDate : (task.toDate || task.end || task.to))}
              onChange={(date) => setEditedToDate(formatDateToString(date))}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              placeholderText="---"
              disabled={!isEditing}
              className={`w-full bg-transparent text-center font-semibold outline-none ${
                isEditing ? 'cursor-pointer border-b border-indigo-500' : 'cursor-default'
              } ${isDarkMode ? 'text-slate-200 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
            />
          </div>

          {/* Hoàn thành */}
          <div className={`p-1.5 rounded-lg text-center flex flex-col items-center ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            <span className="block text-[10px] opacity-70 mb-1">Hoàn thành</span>
            <DatePicker
              selected={parseDateValue(isEditing ? editedDueDate : (task.dueDate || task.endDate || task.date || task.completeDate || task.completedDate))}
              onChange={(date) => setEditedDueDate(formatDateToString(date))}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              placeholderText="---"
              disabled={!isEditing}
              className={`w-full bg-transparent text-center font-semibold text-blue-500 outline-none ${
                isEditing ? 'cursor-pointer border-b border-blue-500' : 'cursor-default'
              }`}
            />
          </div>
        </div>

        {/* Nút Lưu / Hủy khi đang bật chế độ chỉnh sửa */}
        {isEditing && (
          <div className="flex gap-1.5 justify-end mt-2.5 pt-1">
            <button 
              onClick={handleSave}
              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-500 font-medium transition"
            >
              Lưu thay đổi
            </button>
            <button 
              onClick={handleCancel}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}