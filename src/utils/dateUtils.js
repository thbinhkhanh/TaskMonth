// src/utils/dateUtils.js

export const generateTaskId = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `${dateStr} ${timeStr}`;
};

export const formatDateVN = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Chuyển đổi linh hoạt (String, Date, Firestore Timestamp) sang timestamp (ms) để so sánh
export const parseDateForSort = (val) => {
  if (!val) return 0;
  if (val instanceof Date && !isNaN(val.getTime())) return val.getTime();
  if (typeof val.toDate === 'function') {
    const tsDate = val.toDate();
    return isNaN(tsDate.getTime()) ? 0 : tsDate.getTime();
  }
  
  if (typeof val === 'string') {
    const cleanVal = val.trim();
    if (!cleanVal) return 0;

    const datePart = cleanVal.split(' ')[0];
    const parts = datePart.split(/[-/]/);

    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }
  return 0;
};

// Hàm sắp xếp danh sách công việc giảm dần theo ngày bắt đầu (fromDate)
export const sortTasksByFromDateDesc = (tasks) => {
  if (!Array.isArray(tasks)) return [];
  
  return [...tasks].sort((a, b) => {
    const timeA = parseDateForSort(a.fromDate || a.startDate || a.from || a.start);
    const timeB = parseDateForSort(b.fromDate || b.startDate || b.from || b.start);
    
    // Nếu trùng ngày bắt đầu, ưu tiên sắp xếp theo thời gian tạo (createdAt) giảm dần
    if (timeB === timeA) {
      const createdA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const createdB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return createdB - createdA;
    }

    return timeB - timeA; // Giảm dần (Mới nhất lên trên)
  });
};