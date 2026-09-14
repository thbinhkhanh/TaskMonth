import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeTasks, 
  addTask as apiAddTask, 
  toggleTaskDone as apiToggleTaskDone, 
  updateTaskDate as apiUpdateTaskDate,
  updateTaskTitle as apiUpdateTaskTitle,
  deleteTask as apiDeleteTask 
} from '../services/taskService';
import { sortTasksByFromDateDesc } from '../utils/dateUtils';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  // 1. Khởi tạo state bằng localStorage và sort luôn dữ liệu ban đầu
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('taskmonth_tasks');
      return savedTasks ? sortTasksByFromDateDesc(JSON.parse(savedTasks)) : [];
    } catch (error) {
      console.error("Lỗi đọc localStorage:", error);
      return [];
    }
  });

  // 🎯 Đặt loading là false ngay từ đầu để không bị chờ mạng khi mở app
  const [loading, setLoading] = useState(false);

  // 2. Tự động lưu vào localStorage mỗi khi tasks thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('taskmonth_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Lỗi ghi localStorage:", error);
    }
  }, [tasks]);

  // 3. Lắng nghe ngầm Firestore tối ưu và tự động sort dữ liệu nhận về
  useEffect(() => {
    const unsubscribe = subscribeTasks((tasksData) => {
      if (tasksData) {
        const sortedCloudTasks = sortTasksByFromDateDesc(tasksData);
        setTasks(prevTasks => {
          // Chỉ cập nhật state nếu dữ liệu từ cloud thực sự khác biệt 
          // tránh việc re-render nặng nề gây chậm app
          if (JSON.stringify(prevTasks) !== JSON.stringify(sortedCloudTasks)) {
            return sortedCloudTasks;
          }
          return prevTasks;
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handler Thêm task (Optimistic Update - kết hợp sort lại danh sách)
  const handleAddTask = async (newTaskData) => {
    const tempId = 'local_' + Date.now();
    const optimisticTask = {
      id: tempId,
      ...newTaskData,
      done: false,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => sortTasksByFromDateDesc([optimisticTask, ...prev]));

    try {
      await apiAddTask(newTaskData);
    } catch (error) {
      console.error("Lỗi khi thêm công việc:", error);
      alert("Lưu cục bộ thành công nhưng lỗi đồng bộ lên Firestore!");
    }
  };

  // Handler Đổi trạng thái task
  const handleToggleTask = async (task) => {
    const previousTasks = [...tasks];
    const newDoneState = !task.done;

    setTasks(prev => sortTasksByFromDateDesc(
      prev.map(t => t.id === task.id ? { ...t, done: newDoneState } : t)
    ));

    try {
      await apiToggleTaskDone(task);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      setTasks(previousTasks);
    }
  };

  // Handler Thay đổi ngày (Sắp xếp lại ngay khi ngày thay đổi để task tự chạy đúng vị trí)
  const handleTaskDateChange = async (taskId, field, dateValue) => {
    const previousTasks = [...tasks];

    setTasks(prev => sortTasksByFromDateDesc(
      prev.map(t => t.id === taskId ? { ...t, [field]: dateValue } : t)
    ));

    try {
      await apiUpdateTaskDate(taskId, field, dateValue);
    } catch (error) {
      console.error("Lỗi khi cập nhật ngày:", error);
      setTasks(previousTasks);
    }
  };

  // Handler Cập nhật tên tiêu đề
  const handleUpdateTitle = async (taskId, newTitle) => {
    const previousTasks = [...tasks];

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title: newTitle } : t));

    try {
      await apiUpdateTaskTitle(taskId, newTitle);
    } catch (error) {
      console.error("Lỗi khi cập nhật tên công việc:", error);
      setTasks(previousTasks);
    }
  };

  // Handler Xóa task
  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...tasks];

    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await apiDeleteTask(taskId);
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
      setTasks(previousTasks);
    }
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      loading, 
      handleAddTask, 
      handleToggleTask, 
      handleTaskDateChange, 
      handleUpdateTitle, 
      handleDeleteTask 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}