import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeTasks, 
  addTask as apiAddTask, 
  toggleTaskDone as apiToggleTaskDone, 
  updateTaskDate as apiUpdateTaskDate,
  updateTaskTitle as apiUpdateTaskTitle,
  deleteTask as apiDeleteTask 
} from '../services/taskService';

// Import service chi tiêu mới tạo
import { 
  subscribeExpenses, 
  addExpense as apiAddExpense, 
  updateExpense as apiUpdateExpense, 
  deleteExpense as apiDeleteExpense 
} from '../services/expenseService';

import { sortTasksByFromDateDesc } from '../utils/dateUtils';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  // --- STATE TASKS (Công việc) ---
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('taskmonth_tasks');
      return savedTasks ? sortTasksByFromDateDesc(JSON.parse(savedTasks)) : [];
    } catch (error) {
      console.error("Lỗi đọc localStorage tasks:", error);
      return [];
    }
  });

  // --- STATE EXPENSES (Chi tiêu) ---
  const [expenses, setExpenses] = useState(() => {
    try {
      const savedExpenses = localStorage.getItem('taskmonth_expenses');
      return savedExpenses ? JSON.parse(savedExpenses) : [];
    } catch (error) {
      console.error("Lỗi đọc localStorage expenses:", error);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Lưu localStorage cho Tasks
  useEffect(() => {
    try {
      localStorage.setItem('taskmonth_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Lỗi ghi localStorage tasks:", error);
    }
  }, [tasks]);

  // Lưu localStorage cho Expenses
  useEffect(() => {
    try {
      localStorage.setItem('taskmonth_expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error("Lỗi ghi localStorage expenses:", error);
    }
  }, [expenses]);

  // Lắng nghe ngầm Firestore cho Tasks
  useEffect(() => {
    const unsubscribeTasks = subscribeTasks((tasksData) => {
      if (tasksData) {
        const sortedCloudTasks = sortTasksByFromDateDesc(tasksData);
        setTasks(prev => JSON.stringify(prev) !== JSON.stringify(sortedCloudTasks) ? sortedCloudTasks : prev);
      }
    });

    // Lắng nghe ngầm Firestore cho Expenses
    const unsubscribeExpenses = subscribeExpenses((expensesData) => {
      if (expensesData) {
        setExpenses(prev => JSON.stringify(prev) !== JSON.stringify(expensesData) ? expensesData : prev);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeExpenses();
    };
  }, []);

  // --- CÁC HÀM XỬ LÝ TASKS ---
  const handleAddTask = async (newTaskData) => {
    const tempId = 'local_' + Date.now();
    const optimisticTask = { id: tempId, ...newTaskData, done: false, createdAt: new Date().toISOString() };
    setTasks(prev => sortTasksByFromDateDesc([optimisticTask, ...prev]));
    try {
      await apiAddTask(newTaskData);
    } catch (error) {
      console.error("Lỗi khi thêm công việc:", error);
    }
  };

  const handleToggleTask = async (task) => {
    const previousTasks = [...tasks];
    const newDoneState = !task.done;
    setTasks(prev => sortTasksByFromDateDesc(prev.map(t => t.id === task.id ? { ...t, done: newDoneState } : t)));
    try {
      await apiToggleTaskDone(task);
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  const handleTaskDateChange = async (taskId, field, dateValue) => {
    const previousTasks = [...tasks];
    setTasks(prev => sortTasksByFromDateDesc(prev.map(t => t.id === taskId ? { ...t, [field]: dateValue } : t)));
    try {
      await apiUpdateTaskDate(taskId, field, dateValue);
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  const handleUpdateTitle = async (taskId, newTitle) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title: newTitle } : t));
    try {
      await apiUpdateTaskTitle(taskId, newTitle);
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await apiDeleteTask(taskId);
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  // --- CÁC HÀM XỬ LÝ EXPENSES (Chi tiêu) ---
  const handleAddExpense = async (expenseData) => {
    const tempId = 'local_exp_' + Date.now();
    const optimisticExpense = {
      id: tempId,
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [optimisticExpense, ...prev]);

    try {
      await apiAddExpense(expenseData);
    } catch (error) {
      console.error("Lỗi khi thêm chi tiêu:", error);
    }
  };

  const handleUpdateExpense = async (expenseId, updatedData) => {
    const previousExpenses = [...expenses];
    setExpenses(prev => prev.map(item => item.id === expenseId ? { ...item, ...updatedData } : item));

    try {
      await apiUpdateExpense(expenseId, updatedData);
    } catch (error) {
      console.error("Lỗi khi cập nhật chi tiêu:", error);
      setExpenses(previousExpenses);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const previousExpenses = [...expenses];
    setExpenses(prev => prev.filter(item => item.id !== expenseId));

    try {
      await apiDeleteExpense(expenseId);
    } catch (error) {
      console.error("Lỗi khi xóa chi tiêu:", error);
      setExpenses(previousExpenses);
    }
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      expenses,
      loading, 
      handleAddTask, 
      handleToggleTask, 
      handleTaskDateChange, 
      handleUpdateTitle, 
      handleDeleteTask,
      handleAddExpense,
      handleUpdateExpense,
      handleDeleteExpense
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}