import React from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

export default function TaskLogTab({ tasks, loading, onToggle, onDateChange, onAddTask, onDelete, onUpdateTitle }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Thêm class 'no-scrollbar' vào đây để ẩn thanh cuộn */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-48">
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Danh sách công việc</span>
          <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900/50">
            {tasks.length} công việc
          </span>
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-500 py-8">Đang tải dữ liệu từ Firestore...</div>
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

      <TaskForm onAddTask={onAddTask} />
    </div>
  );
}