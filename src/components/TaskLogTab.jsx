import React from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { useTheme } from '../App'; // Import hook useTheme để lấy trạng thái sáng/tối

export default function TaskLogTab({ tasks, loading, onToggle, onDateChange, onAddTask, onDelete, onUpdateTitle, selectedMonth }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex-1 flex flex-col min-h-0 relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Thêm class 'no-scrollbar' vào đây để ẩn thanh cuộn */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-48">
        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider px-1">
          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Danh sách công việc</span>
          <span className={`px-2 py-0.5 rounded-full border ${
            isDarkMode 
              ? 'bg-indigo-950 text-indigo-400 border-indigo-900/50' 
              : 'bg-indigo-50 text-indigo-600 border-indigo-200'
          }`}>
            {tasks.length} công việc
          </span>
        </div>

        {loading ? (
          <div className={`text-center text-xs py-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Đang tải dữ liệu từ Firestore...
          </div>
        ) : tasks.length === 0 ? (
          <div className={`text-center text-xs py-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Không có công việc nào trong tháng này.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={onToggle} 
                onDateChange={onDateChange}
                onDelete={onDelete}
                onUpdateTitle={onUpdateTitle}
              />
            ))}
          </div>
        )}
      </main>

      <TaskForm onAddTask={onAddTask} selectedMonth={selectedMonth} />
    </div>
  );
}