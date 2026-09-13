import React, { useState, useEffect } from 'react';
import { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

// Import Services
import { 
  subscribeTasks, 
  addTask, 
  toggleTaskDone, 
  updateTaskDate 
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

  return (
    <div className="bg-white min-h-screen text-slate-100 font-sans antialiased flex justify-center items-center p-4">
      {/* Dynamic Style cho DatePicker */}
      <style>{`
        .react-datepicker { background-color: #0f172a; border-color: #334155; color: #f8fafc; font-family: inherit; font-size: 12px; }
        .react-datepicker__header { background-color: #1e293b; border-bottom-color: #334155; }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header, .react-datepicker__day-name { color: #cbd5e1; }
        .react-datepicker__day { color: #e2e8f0; }
        .react-datepicker__day:hover { background-color: #334155; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #6366f1 !important; color: white; }
      `}</style>

      {/* Khung mô phỏng di động */}
      <div className="w-full max-w-md bg-slate-950 h-[800px] rounded-lg shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between relative">
        
        {/* Header */}
        <Header 
          activeTab={activeTab} 
          selectedMonth={selectedMonth} 
          setSelectedMonth={setSelectedMonth} 
        />

        {/* Nội dung theo Tab */}
        {activeTab === 'log' ? (
          <TaskLogTab 
            tasks={tasks}
            loading={loading}
            onToggle={handleToggleTask}
            onDateChange={handleTaskDateChange}
            onAddTask={handleAddTask}
          />
        ) : (
          <StatsTab 
            tasks={tasks} 
            selectedMonth={selectedMonth} 
          />
        )}

        {/* Navigation Bar */}
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
    </div>
  );
}