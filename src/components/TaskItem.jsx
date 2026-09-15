import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../App';

export default function TaskItem({ task, onToggle, onDateChange, onDelete, onUpdateTitle }) {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title || '');

  // State quản lý hiển thị popup lịch cho từng trường: null | 'from' | 'to' | 'due'
  const [activeDatePicker, setActiveDatePicker] = useState(null);

  // Ref để tự động điều chỉnh chiều cao textarea theo nội dung
  const textareaRef = useRef(null);

  // State tạm thời để lưu ngày tháng khi đang ở chế độ chỉnh sửa
  const [editedFromDate, setEditedFromDate] = useState(task.fromDate || task.startDate || task.from || task.start || '');
  const [editedToDate, setEditedToDate] = useState(task.toDate || task.end || task.to || '');
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || task.endDate || task.date || task.completeDate || task.completedDate || '');

  // Đóng popup lịch khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.datepicker-container')) {
        setActiveDatePicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tự động điều chỉnh chiều cao của textarea khi bật chế độ sửa hoặc khi nội dung thay đổi
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedTitle]);

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
    if (editedTitle.trim() && onUpdateTitle) {
      onUpdateTitle(task.id, editedTitle.trim());
    }
    if (onDateChange) {
      onDateChange(task.id, 'fromDate', editedFromDate);
      onDateChange(task.id, 'toDate', editedToDate);
      onDateChange(task.id, 'dueDate', editedDueDate);
    }
    setIsEditing(false);
    setActiveDatePicker(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveDatePicker(null);
    setEditedTitle(task.title);
    setEditedFromDate(task.fromDate || task.startDate || task.from || task.start || '');
    setEditedToDate(task.toDate || task.end || task.to || '');
    setEditedDueDate(task.dueDate || task.endDate || task.date || task.completeDate || task.completedDate || '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
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

  // Helper hiển thị chuỗi ngày tháng đẹp mắt trên input giả lập
  const getDisplayDateText = (dateVal) => {
    const parsed = parseDateValue(dateVal);
    if (!parsed) return '---';
    return formatDateToString(parsed);
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
                ref={textareaRef}
                value={editedTitle}
                onChange={(e) => {
                  setEditedTitle(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={handleKeyDown}
                autoFocus
                className={`w-full border text-sm rounded-xl p-2.5 outline-none resize-none overflow-hidden leading-relaxed ${
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
                  className={`p-1.5 rounded-lg transition ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                  title="Sửa công việc và ngày tháng"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className={`p-1.5 rounded-lg transition ${
                    isDarkMode 
                      ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/50' 
                      : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="Xóa công việc"
                >
                  <Trash2 className="w-4 h-4" />
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
          <div className={`relative datepicker-container p-1.5 rounded-lg text-center flex flex-col items-center ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            <span className="block text-[10px] opacity-70 mb-1">Từ ngày</span>
            <div
              onClick={() => isEditing && setActiveDatePicker(activeDatePicker === 'from' ? null : 'from')}
              className={`w-full bg-transparent text-center font-semibold outline-none py-0.5 ${
                isEditing ? 'cursor-pointer border-b border-indigo-500 hover:opacity-80' : 'cursor-default'
              } ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
            >
              {getDisplayDateText(isEditing ? editedFromDate : (task.fromDate || task.startDate || task.from || task.start))}
            </div>

            {/* Popup lịch Win 11 cho Từ ngày */}
            {isEditing && activeDatePicker === 'from' && (
              <div className="absolute left-0 top-full mt-1 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                <DatePicker
                  selected={parseDateValue(editedFromDate)}
                  onChange={(date) => {
                    setEditedFromDate(formatDateToString(date));
                    setActiveDatePicker(null);
                  }}
                  inline
                  locale="vi"
                />
              </div>
            )}
          </div>

          {/* Đến ngày */}
          <div className={`relative datepicker-container p-1.5 rounded-lg text-center flex flex-col items-center ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            <span className="block text-[10px] opacity-70 mb-1">Đến ngày</span>
            <div
              onClick={() => isEditing && setActiveDatePicker(activeDatePicker === 'to' ? null : 'to')}
              className={`w-full bg-transparent text-center font-semibold outline-none py-0.5 ${
                isEditing ? 'cursor-pointer border-b border-indigo-500 hover:opacity-80' : 'cursor-default'
              } ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
            >
              {getDisplayDateText(isEditing ? editedToDate : (task.toDate || task.end || task.to))}
            </div>

            {/* Popup lịch Win 11 cho Đến ngày */}
            {isEditing && activeDatePicker === 'to' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                <DatePicker
                  selected={parseDateValue(editedToDate)}
                  onChange={(date) => {
                    setEditedToDate(formatDateToString(date));
                    setActiveDatePicker(null);
                  }}
                  inline
                  locale="vi"
                />
              </div>
            )}
          </div>

          {/* Hoàn thành */}
          <div className={`relative datepicker-container p-1.5 rounded-lg text-center flex flex-col items-center ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            <span className="block text-[10px] opacity-70 mb-1">Hoàn thành</span>
            <div
              onClick={() => isEditing && setActiveDatePicker(activeDatePicker === 'due' ? null : 'due')}
              className={`w-full bg-transparent text-center font-semibold text-blue-500 outline-none py-0.5 ${
                isEditing ? 'cursor-pointer border-b border-blue-500 hover:opacity-80' : 'cursor-default'
              }`}
            >
              {getDisplayDateText(isEditing ? editedDueDate : (task.dueDate || task.endDate || task.date || task.completeDate || task.completedDate))}
            </div>

            {/* Popup lịch Win 11 cho Hoàn thành */}
            {isEditing && activeDatePicker === 'due' && (
              <div className="absolute right-0 top-full mt-1 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                <DatePicker
                  selected={parseDateValue(editedDueDate)}
                  onChange={(date) => {
                    setEditedDueDate(formatDateToString(date));
                    setActiveDatePicker(null);
                  }}
                  inline
                  locale="vi"
                />
              </div>
            )}
          </div>
        </div>

        {/* Nút Lưu / Hủy khi đang bật chế độ chỉnh sửa */}
        {isEditing && (
          <div className="flex gap-1.5 justify-end mt-2.5 pt-1">
            <button 
              onClick={handleSave}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-500 font-medium transition"
            >
              Lưu thay đổi
            </button>
            <button 
              onClick={handleCancel}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
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