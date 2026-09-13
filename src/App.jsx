import React, { useState, useMemo } from 'react';
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

  // 🎯 TỐI ƯU HIỆU NĂNG: Dùng useMemo để cache kết quả lọc, 
  // chỉ parse ngày tháng khi danh sách task hoặc tháng được chọn thay đổi.
  const filteredTasks = useMemo(() => {
    const targetMonth = selectedMonth.getMonth();
    const targetYear = selectedMonth.getFullYear();

    return tasks.filter(task => {
      const taskDateValue = task.date || task.dueDate || task.createdAt;
      if (!taskDateValue) return false;

      let taskDate;
      if (typeof taskDateValue === 'string') {
        const datePart = taskDateValue.split(' ')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
          taskDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          taskDate = new Date(taskDateValue);
        }
      } else if (typeof taskDateValue.toDate === 'function') {
        taskDate = taskDateValue.toDate();
      } else {
        taskDate = new Date(taskDateValue);
      }

      if (isNaN(taskDate.getTime())) return false;

      return (
        taskDate.getMonth() === targetMonth &&
        taskDate.getFullYear() === targetYear
      );
    });
  }, [tasks, selectedMonth]);

  return (
    <div className="w-full max-w-md bg-slate-950 h-[800px] rounded-lg shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between relative">
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

// Component App chính bọc TaskProvider bên ngoài
export default function App() {
  return (
    <div className="bg-white min-h-screen text-slate-100 font-sans antialiased flex justify-center items-center p-4">
      <style>{`
        /* Khung tổng thể popup lịch */
        .react-datepicker { 
          background-color: #0f172a; 
          border: 1px solid #334155; 
          color: #f8fafc; 
          font-family: inherit; 
          border-radius: 16px; 
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
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
        
        /* 🎯 Khôi phục và làm đẹp màu sắc cho lịch chọn ngày chi tiết (Day picker) */
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

        /* 🎯 Lưới chọn tháng phong cách Windows (3 cột x 4 hàng đều đặn) */
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
        
        /* Từng ô chọn tháng */
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

        /* Nút chuyển năm (Trái / Phải) */
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