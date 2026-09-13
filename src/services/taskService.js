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

// 1. Lắng nghe dữ liệu realtime
export const subscribeTasks = (onDataLoaded) => {
  const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const tasksData = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate ? data.startDate.toDate() : new Date(),
        endDate: data.endDate ? data.endDate.toDate() : null,
      };
    });
    onDataLoaded(tasksData);
  });
};

// 2. Thêm mới công việc
export const addTask = async ({ title, startDate, endDate }) => {
  if (!title.trim()) return;
  const customId = generateTaskId();

  await setDoc(doc(db, TASKS_COLLECTION, customId), {
    title,
    startDate: Timestamp.fromDate(startDate || new Date()),
    endDate: endDate ? Timestamp.fromDate(endDate) : null,
    done: Boolean(endDate),
    createdAt: Timestamp.now()
  });
};

// 3. Đổi trạng thái Hoàn thành / Chưa hoàn thành
export const toggleTaskDone = async (task) => {
  const taskRef = doc(db, TASKS_COLLECTION, task.id);
  const isNowDone = !task.done;
  const newEndDate = isNowDone ? (task.endDate || new Date()) : null;

  await updateDoc(taskRef, {
    done: isNowDone,
    endDate: newEndDate ? Timestamp.fromDate(newEndDate) : null
  });
};

// 4. Cập nhật ngày bắt đầu / kết thúc
export const updateTaskDate = async (taskId, field, dateValue) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const updateData = {
    [field]: dateValue ? Timestamp.fromDate(dateValue) : null
  };
  
  if (field === 'endDate') {
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