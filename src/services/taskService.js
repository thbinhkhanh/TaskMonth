// src/services/taskService.js
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { generateTaskId } from '../utils/dateUtils';

const TASKS_COLLECTION = 'tasks';

// Hàm phụ lấy ngày hiện tại định dạng DD-MM-YYYY
const getCurrentDateString = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// 1. Lắng nghe dữ liệu realtime
export const subscribeTasks = (onDataLoaded) => {
  const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const tasksData = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      };
    });
    onDataLoaded(tasksData);
  });
};

// 2. Thêm mới công việc
export const addTask = async ({ title, fromDate = '', toDate = '' }) => {
  if (!title.trim()) return;
  const customId = generateTaskId();

  await setDoc(doc(db, TASKS_COLLECTION, customId), {
    title: title.trim(),
    fromDate: fromDate || '',
    toDate: toDate || '',
    dueDate: '',
    done: false,
    createdAt: Timestamp.now()
  });
};

// 3. Đổi trạng thái Hoàn thành / Chưa hoàn thành
export const toggleTaskDone = async (task) => {
  const taskRef = doc(db, TASKS_COLLECTION, task.id);
  const isNowDone = !task.done;
  const newDueDate = isNowDone ? (task.dueDate || getCurrentDateString()) : '';

  await updateDoc(taskRef, {
    done: isNowDone,
    dueDate: newDueDate
  });
};

// 4. Cập nhật ngày (fromDate, toDate, dueDate)
export const updateTaskDate = async (taskId, field, dateValue) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const updateData = {
    [field]: dateValue || ''
  };
  
  // Nếu cập nhật ô "dueDate" (Hoàn thành), tự động đồng bộ trạng thái done
  if (field === 'dueDate') {
    updateData.done = Boolean(dateValue);
  }

  await updateDoc(taskRef, updateData);
};

// 5. Cập nhật tên công việc
export const updateTaskTitle = async (taskId, newTitle) => {
  if (!newTitle.trim()) return;
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    title: newTitle.trim()
  });
};

// 6. Xóa công việc
export const deleteTask = async (taskId) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskRef);
};