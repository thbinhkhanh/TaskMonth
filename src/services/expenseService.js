import { 
  collection, 
  addDoc, 
  setDoc,     // <-- 1. Thêm setDoc để có thể tự chỉ định ID cho document
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

// Đường dẫn đến file config firebase của bạn
import { db } from '../firebase'; 

const COLLECTION_NAME = 'expenses';

// Format ngày giờ hiện tại thành định dạng: DD-MM-YYYY HH-mm-ss
const getFormattedTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0'); // Thêm mili-giây để tránh trùng ID nếu bấm liên tục trong cùng 1 giây
  
  return `${day}-${month}-${year} ${hours}-${minutes}-${seconds}-${ms}`;
};

// 1. Lắng nghe dữ liệu realtime từ collection 'expenses'
export const subscribeExpenses = (callback) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expensesList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(expensesList);
  }, (error) => {
    console.error("Lỗi lắng nghe Firestore expenses:", error);
  });
};

// 2. Thêm khoản chi mới với Document ID chính là thời gian
export const addExpense = async (expenseData) => {
  const customId = getFormattedTimestamp(); // Tạo chuỗi ID theo thời gian thực (VD: 14-09-2026 19-18-34-123)

  // 🎯 Đảm bảo trường amount luôn được chuyển đổi thành kiểu số (Number) sạch sẽ
  const rawAmount = expenseData.amount;
  const numericAmount = typeof rawAmount === 'string' 
    ? Number(rawAmount.replace(/,/g, '')) 
    : Number(rawAmount);

  const payload = {
    ...expenseData,
    amount: isNaN(numericAmount) ? 0 : numericAmount, // Gán số tiền đã được ép kiểu sạch
    createdAt: customId, // Lưu chuỗi này làm thời gian tạo trong field luôn
  };

  // Sử dụng doc() kết hợp setDoc() để ép ID document trùng với customId
  const docRef = doc(db, COLLECTION_NAME, customId);
  await setDoc(docRef, payload);

  return { id: customId, ...payload };
};

// 3. Cập nhật khoản chi
export const updateExpense = async (expenseId, updatedData) => {
  // Nếu có cập nhật số tiền, cũng làm sạch dấu phẩy
  let payload = { ...updatedData };
  if (payload.amount !== undefined) {
    const rawAmount = payload.amount;
    const numericAmount = typeof rawAmount === 'string' 
      ? Number(rawAmount.replace(/,/g, '')) 
      : Number(rawAmount);
    payload.amount = isNaN(numericAmount) ? 0 : numericAmount;
  }

  const docRef = doc(db, COLLECTION_NAME, expenseId);
  await updateDoc(docRef, payload);
};

// 4. Xóa khoản chi
export const deleteExpense = async (expenseId) => {
  const docRef = doc(db, COLLECTION_NAME, expenseId);
  await deleteDoc(docRef);
};