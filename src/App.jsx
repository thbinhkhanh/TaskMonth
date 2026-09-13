import React, { useState } from 'react';
import { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

// Import TaskProvider và custom hook
import { TaskProvider, useTasks } from './context/TaskContext';

// Import Components
import Header from './components/Header';
import TaskLogTab from './components/TaskLogTab';
import StatsTab from './components/StatsTab';
import Navigation from './components/Navigation';

registerLocale('vi', vi);

// Component con bên trong để tận dụng useTasks()
function MainContent() {
  const [activeTab, setActiveTab] = useState('log');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Lấy toàn bộ state và hàm xử lý trực tiếp từ TaskProvider (Context + LocalStorage + Firestore)
  const { 
    tasks, 
    loading, 
    handleAddTask, 
    handleToggleTask, 
    handleTaskDateChange, 
    handleUpdateTitle, 
    handleDeleteTask 
  } = useTasks();

  return (
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
  );
}

// Component App chính bọc TaskProvider bên ngoài
export default function App() {
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

      <TaskProvider>
        <MainContent />
      </TaskProvider>
    </div>
  );
}