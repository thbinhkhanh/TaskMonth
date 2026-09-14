import React, { useState, useMemo, createContext, useContext } from 'react';
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

// 🎯 Tạo Theme Context để quản lý chế độ Sáng / Tối toàn ứng dụng và lưu trạng thái
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false); // Mặc định là giao diện sáng theo yêu cầu
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Component con bên trong để tận dụng useTasks() và useTheme()
function MainContent() {
  const [activeTab, setActiveTab] = useState('log');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { isDarkMode } = useTheme();

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

  // 🎯 TỐI ƯU HIỆU NĂNG: Dùng useMemo để cache kết quả lọc theo tháng/năm
  // 🎯 TỐI ƯU HIỆU NĂNG & SỬA LỖI HIỂN THỊ: Lọc task chính xác theo tháng được chọn
  const filteredTasks = useMemo(() => {
    const targetMonth = selectedMonth.getMonth();
    const targetYear = selectedMonth.getFullYear();

    return tasks.filter(task => {
      // Ưu tiên quét các trường ngày có sẵn của task
      const taskDateValue = task.fromDate || task.toDate || task.dueDate || task.date || task.createdAt;
      
      if (!taskDateValue) return true; // Nếu hoàn toàn không có ngày tháng, vẫn cho hiển thị để tránh mất dữ liệu

      let taskDate;
      if (typeof taskDateValue === 'string') {
        const cleanVal = taskDateValue.trim();
        const datePart = cleanVal.split(' ')[0]; 
        const parts = datePart.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 2 && parts[2].length === 4) {
            taskDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          } else {
            taskDate = new Date(datePart);
          }
        } else {
          taskDate = new Date(taskDateValue);
        }
      } else if (typeof taskDateValue.toDate === 'function') {
        taskDate = taskDateValue.toDate();
      } else {
        taskDate = new Date(taskDateValue);
      }

      // Nếu ngày parse bị lỗi, vẫn cho hiển thị task để người dùng không bị mất dữ liệu trên giao diện
      if (isNaN(taskDate.getTime())) return true;

      return (
        taskDate.getMonth() === targetMonth &&
        taskDate.getFullYear() === targetYear
      );
    });
  }, [tasks, selectedMonth]);

  return (
    <div className={`w-full max-w-md h-[840px] rounded-2xl shadow-2xl border flex flex-col justify-between relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <Header 
        activeTab={activeTab} 
        selectedMonth={selectedMonth} 
        setSelectedMonth={setSelectedMonth} 
      />

      {activeTab === 'log' ? (
        <TaskLogTab 
          tasks={filteredTasks}  
          loading={loading}
          onToggle={handleToggleTask}
          onDateChange={handleTaskDateChange}
          onAddTask={handleAddTask}
          onDelete={handleDeleteTask}
          onUpdateTitle={handleUpdateTitle}
          selectedMonth={selectedMonth}
        />
      ) : (
        <StatsTab 
          tasks={filteredTasks}  
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

// Component App chính bọc TaskProvider và ThemeProvider bên ngoài
export default function App() {
  return (
    <ThemeProvider>
      <AppWrapper />
    </ThemeProvider>
  );
}

// Component trung gian để nhận trạng thái theme và đổi màu nền tổng thể ngoài khung app
function AppWrapper() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-center items-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Nút chuyển đổi Sáng / Tối nổi phía trên ứng dụng hoặc tích hợp gọn gàng */}
      <div className="w-full max-w-md flex justify-end mb-2">
        <button 
          onClick={toggleTheme}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {isDarkMode ? '☀️ Chế độ Sáng' : '🌙 Chế độ Tối'}
        </button>
      </div>

      <style>{`
        /* 🎯 Căn giữa popup lịch hoàn hảo trên mọi màn hình (mobile & desktop) */
        .react-datepicker-popper {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 99999 !important;
        }

        /* Ẩn mũi tên tam giác định hướng của react-datepicker */
        .react-datepicker__triangle {
          display: none !important;
        }

        /* Khung tổng thể popup lịch */
        .react-datepicker { 
          background-color: #0f172a; 
          border: 1px solid #334155; 
          color: #f8fafc; 
          font-family: inherit; 
          border-radius: 16px; 
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.7);
          overflow: hidden; 
          padding: 12px;
        }
        .react-datepicker__header { 
          background-color: transparent; 
          border-bottom: none; 
          padding-top: 4px; 
        }
        .react-datepicker__current-month { 
          color: #f8fafc; 
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .react-datepicker__day-name { 
          color: #94a3b8; 
          font-weight: 600;
          width: 2rem;
        }
        .react-datepicker__day { 
          color: #e2e8f0; 
          border-radius: 8px;
          width: 2rem;
          line-height: 2rem;
          margin: 0.2rem;
        }
        .react-datepicker__day:hover { 
          background-color: #334155; 
          color: #ffffff;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected { 
          background-color: #6366f1 !important; 
          color: white !important; 
        }
        .react-datepicker__day--outside-month {
          color: #475569 !important;
        }

        .react-datepicker__month-year-wrapper {
          display: flex;
          flex-direction: column;
        }
        .react-datepicker__month-wrapper {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px; 
          margin-bottom: 10px;
        }
        
        .react-datepicker__month-text {
          display: flex !important;
          align-items: center;
          justify-content: center;
          background-color: #1e293b; 
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 12px 0 !important;
          margin: 0 !important;
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .react-datepicker__month-text:hover { 
          background-color: #334155; 
          color: #ffffff;
          border-color: #475569;
        }
        .react-datepicker__month-text--selected, 
        .react-datepicker__month-text--keyboard-selected { 
          background-color: #6366f1 !important; 
          color: #ffffff !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .react-datepicker__navigation {
          top: 18px;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #94a3b8;
          border-width: 2px 2px 0 0;
        }
        .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #ffffff;
        }
      `}</style>

      <TaskProvider>
        <MainContent />
      </TaskProvider>
    </div>
  );
}