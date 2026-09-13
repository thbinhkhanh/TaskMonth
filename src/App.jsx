import React, { useState, useEffect } from 'react';
import { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

// Import Services
import { 
  subscribeTasks, 
  addTask, 
  toggleTaskDone, 
  updateTaskDate,
  updateTaskTitle,
  deleteTask 
} from './services/taskService';

// Import Components
import Header from './components/Header';
import TaskLogTab from './components/TaskLogTab';
import StatsTab from './components/StatsTab';
import Navigation from './components/Navigation';

registerLocale('vi', vi);

export default function App() {
  const [activeTab, setActiveTab] = useState('log');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Đăng ký nhận dữ liệu từ Firestore
  useEffect(() => {
    const unsubscribe = subscribeTasks((tasksData) => {
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handler xử lý thêm task
  const handleAddTask = async (newTaskData) => {
    try {
      await addTask(newTaskData);
    } catch (error) {
      console.error("Lỗi khi thêm công việc:", error);
    }
  };

  // Handler đổi trạng thái task
  const handleToggleTask = async (task) => {
    try {
      await toggleTaskDone(task);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // Handler thay đổi ngày của task
  const handleTaskDateChange = async (taskId, field, dateValue) => {
    try {
      await updateTaskDate(taskId, field, dateValue);
    } catch (error) {
      console.error("Lỗi khi cập nhật ngày:", error);
    }
  };

  // Handler cập nhật tên task
  const handleUpdateTitle = async (taskId, newTitle) => {
    try {
      await updateTaskTitle(taskId, newTitle);
    } catch (error) {
      console.error("Lỗi khi cập nhật tên công việc:", error);
    }
  };

  // Handler xóa task
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-100 font-sans antialiased flex justify-center items-center p-4">
      <style>{`
        .react-datepicker { background-color: #0f172a; border-color: #334155; color: #f8fafc; font-family: inherit; font-size: 12px; }
        .react-datepicker__header { background-color: #1e293b; border-bottom-color: #334155; }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header, .react-datepicker__day-name { color: #cbd5e1; }
        .react-datepicker__day { color: #e2e8f0; }
        .react-datepicker__day:hover { background-color: #334155; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #6366f1 !important; color: white; }
      `}</style>

      <div className="w-full max-w-md bg-slate-950 h-[800px] rounded-lg shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between relative">
        
        <Header 
          activeTab={activeTab} 
          selectedMonth={selectedMonth} 
          setSelectedMonth={setSelectedMonth} 
        />

        {activeTab === 'log' ? (
          <TaskLogTab 
            tasks={tasks}
            loading={loading}
            onToggle={handleToggleTask}
            onDateChange={handleTaskDateChange}
            onAddTask={handleAddTask}
            onDelete={handleDeleteTask}
            onUpdateTitle={handleUpdateTitle}
          />
        ) : (
          <StatsTab 
            tasks={tasks} 
            selectedMonth={selectedMonth} 
          />
        )}

        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
    </div>
  );
}