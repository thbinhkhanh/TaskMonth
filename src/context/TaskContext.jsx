import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeTasks, 
  addTask as apiAddTask, 
  toggleTaskDone as apiToggleTaskDone, 
  updateTaskDate as apiUpdateTaskDate,
  updateTaskTitle as apiUpdateTaskTitle,
  deleteTask as apiDeleteTask 
} from '../services/taskService';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  // 1. Khởi tạo state bằng localStorage để hiển thị tức thì (0ms)
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('taskmonth_tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Lỗi đọc localStorage:", error);
      return [];
    }
  });

  const [loading, setLoading] = useState(tasks.length === 0);

  // 2. Tự động lưu vào localStorage mỗi khi tasks thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('taskmonth_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Lỗi ghi localStorage:", error);
    }
  }, [tasks]);

  // 3. Lắng nghe ngầm Firestore để cập nhật dữ liệu mới nhất từ cloud
  useEffect(() => {
    const unsubscribe = subscribeTasks((tasksData) => {
      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handler Thêm task (Optimistic Update)
  const handleAddTask = async (newTaskData) => {
    const tempId = 'local_' + Date.now();
    const optimisticTask = {
      id: tempId,
      ...newTaskData,
      done: false,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [optimisticTask, ...prev]);

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

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDoneState } : t));

    try {
      await apiToggleTaskDone(task);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      setTasks(previousTasks);
    }
  };

  // Handler Thay đổi ngày
  const handleTaskDateChange = async (taskId, field, dateValue) => {
    const previousTasks = [...tasks];

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: dateValue } : t));

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