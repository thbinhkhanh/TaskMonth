import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Tag, 
  Wallet,
  PieChart,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../App';

// Các danh mục chi tiêu phổ biến gợi ý kèm mã màu phân biệt
const CATEGORY_CONFIG = {
  'Ăn uống': { color: 'from-amber-500 to-orange-600', dot: 'bg-amber-500' },
  'Mua sắm': { color: 'from-pink-500 to-rose-600', dot: 'bg-pink-500' },
  'Hóa đơn (Điện/Nước/Net)': { color: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500' },
  'Đi lại (Xăng/Xe)': { color: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500' },
  'Giải trí': { color: 'from-purple-500 to-violet-600', dot: 'bg-purple-500' },
  'Giáo dục': { color: 'from-cyan-500 to-blue-600', dot: 'bg-cyan-500' },
  'Y tế': { color: 'from-red-500 to-rose-600', dot: 'bg-red-500' },
  'Khác': { color: 'from-slate-500 to-zinc-600', dot: 'bg-slate-500' }
};

const DEFAULT_CATEGORIES = Object.keys(CATEGORY_CONFIG);

// Hàm format số tiền thành chuỗi có dấu phẩy ngăn cách hàng nghìn
const formatCurrencyInput = (value) => {
  if (!value && value !== 0) return '';
  const numericValue = value.toString().replace(/\D/g, '');
  if (!numericValue) return '';
  return Number(numericValue).toLocaleString('en-US');
};

export default function ExpenseTab({ expenses, onAddExpense, onDeleteExpense, onUpdateExpense }) {
  const { isDarkMode } = useTheme();

  // State form thêm mới khoản chi
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [date, setDate] = useState(new Date());
  
  // State điều khiển lịch chọn ngày cho form thêm mới
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State điều khiển ẩn/hiện biểu đồ thống kê
  const [showChart, setShowChart] = useState(false);

  // State hỗ trợ chức năng sửa nhanh trực tiếp trên item
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Xử lý Thêm khoản chi mới
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const numericAmount = parseFloat(amount.toString().replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      amount: numericAmount,
      category,
      date: date.toISOString(),
    });

    setTitle('');
    setAmount('');
  };

  // Bắt đầu sửa khoản chi
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditAmount(formatCurrencyInput(item.amount));
    setEditCategory(item.category || DEFAULT_CATEGORIES[0]);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = (id) => {
    const numericAmount = parseFloat(editAmount.toString().replace(/,/g, ''));
    if (!editTitle.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    if (onUpdateExpense) {
      onUpdateExpense(id, {
        title: editTitle.trim(),
        amount: numericAmount,
        category: editCategory
      });
    }
    setEditingId(null);
  };

  // Xử lý xóa có hiển thị cảnh báo xác nhận
  const handleDeleteWithConfirm = (item) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa khoản chi "${item.title}" (${formatMoney(item.amount)}) này không?`;
    if (window.confirm(confirmMessage)) {
      onDeleteExpense(item.id);
    }
  };

  // Tính tổng số tiền chi tiêu trong tháng hiện thị
  const totalExpense = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Thống kê tổng tiền theo từng danh mục để vẽ biểu đồ cột
  const categoryStats = DEFAULT_CATEGORIES.map(cat => {
    const total = expenses
      .filter(item => (item.category || 'Khác') === cat)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return { 
      category: cat, 
      total, 
      color: CATEGORY_CONFIG[cat]?.color || 'from-slate-500 to-slate-700',
      dot: CATEGORY_CONFIG[cat]?.dot || 'bg-slate-500'
    };
  }).filter(stat => stat.total > 0);

  // Tìm giá trị lớn nhất để làm mốc tính chiều cao cột biểu đồ
  const maxCategoryTotal = Math.max(...categoryStats.map(s => s.total), 1);

  // Hàm rút gọn số tiền hiển thị trên đầu cột
  const formatShortMoney = (val) => {
    if (!val) return '0đ';
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'tr';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(0) + 'k';
    }
    return val + 'đ';
  };

  // Format tiền tệ VNĐ đầy đủ có dấu phẩy
  const formatMoney = (val) => {
    if (!val && val !== 0) return '0 đ';
    const numericVal = Number(val) || 0;
    return numericVal.toLocaleString('en-US') + ' đ';
  };

  // GOM NHÓM DANH SÁCH THEO NGÀY (Group expenses by date string YYYY-MM-DD)
  const groupedExpenses = expenses.reduce((groups, item) => {
    const dateKey = item.date ? new Date(item.date).toISOString().split('T')[0] : 'Khác';
    if (!groups[dateKey]) {
      groups[dateKey] = {
        dateStr: item.date ? new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Ngày khác',
        rawDate: item.date ? new Date(item.date) : new Date(0),
        items: []
      };
    }
    groups[dateKey].items.push(item);
    return groups;
  }, {});

  // Sắp xếp các nhóm ngày giảm dần (ngày mới nhất lên trên)
  const sortedDateGroups = Object.values(groupedExpenses).sort((a, b) => b.rawDate - a.rawDate);

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 py-3">
      
      {/* Thẻ tổng quan chi tiêu tháng */}
      <div className={`p-4 rounded-2xl mb-3 border flex items-center justify-between shadow-sm transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-800 text-slate-100' 
          : 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-100 text-slate-800'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Tổng chi tiêu tháng
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {formatMoney(totalExpense)}
            </h2>
          </div>
        </div>

        {/* Nút bấm "Biểu đồ" để bật/tắt biểu đồ cột */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowChart(prev => !prev)}
            title={showChart ? "Ẩn biểu đồ phân bổ" : "Hiện biểu đồ phân bổ"}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              showChart
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                  : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Biểu đồ</span>
          </button>
        </div>
      </div>

      {/* Thẻ thống kê biểu đồ cột */}
      {showChart && (
        <div className={`p-4 rounded-2xl border mb-3 shadow-sm animate-fadeIn transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Biểu đồ phân bổ chi tiêu
              </span>
            </div>
            <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {categoryStats.length} danh mục có phát sinh
            </span>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có dữ liệu chi tiêu để hiển thị biểu đồ.
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-44 pt-6 px-1">
              {categoryStats.map((stat) => {
                const heightPercent = Math.max(Math.round((stat.total / maxCategoryTotal) * 100), 18);
                
                return (
                  <div key={stat.category} className="flex-1 flex flex-col items-center h-full justify-end group/bar relative">
                    <span className={`text-[10px] font-bold mb-1.5 truncate max-w-full tracking-tight ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      {formatShortMoney(stat.total)}
                    </span>

                    <div className="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20 border border-slate-700">
                      <span className="font-semibold">{stat.category}</span>: {formatMoney(stat.total)}
                    </div>

                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[32px] bg-gradient-to-t ${stat.color} transition-all duration-500 shadow-md group-hover/bar:brightness-110`}
                    />
                    
                    {/* Hiển thị đầy đủ nhãn bằng cách cho phép xuống dòng thay vì cắt cụt */}
                    <div className="flex items-center justify-center space-x-1 mt-2 w-full">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stat.dot}`} />
                      <span 
                        className={`text-[10px] leading-tight text-center line-clamp-2 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`} 
                        title={stat.category}
                      >
                        {stat.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form nhập khoản chi tiêu mới */}
      <form onSubmit={handleSubmit} className={`p-3 rounded-2xl border mb-3 shadow-sm transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="space-y-2.5">
          <div className="relative flex items-center">
            <Tag className={`absolute left-3 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập nội dung chi tiêu (VD: Phở bò, Tiền điện...)"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative flex items-center">
              <DollarSign className={`absolute left-3 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={formatCurrencyInput(amount)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  setAmount(rawValue);
                }}
                placeholder="Số tiền (VNĐ)"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(prev => !prev)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{date.toLocaleDateString('vi-VN')}</span>
              </button>

              {showDatePicker && (
                <div className="absolute left-0 top-full mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-white dark:bg-slate-900">
                  <DatePicker
                    selected={date}
                    onChange={(d) => {
                      setDate(d);
                      setShowDatePicker(false);
                    }}
                    inline
                    locale="vi"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!title.trim() || !amount}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
                !title.trim() || !amount
                  ? 'bg-indigo-400/50 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-500/25'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Thêm khoản chi</span>
            </button>
          </div>
        </div>
      </form>

      {/* DANH SÁCH CÁC KHOẢN CHI TIÊU ĐƯỢC GOM NHÓM THEO NGÀY */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {expenses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
            <PieChart className="w-12 h-12 mb-2 text-slate-400 stroke-1" />
            <p className="text-sm font-medium">Chưa có khoản chi tiêu nào trong tháng này</p>
            <p className="text-xs text-slate-400 mt-1">Hãy thêm khoản chi đầu tiên ở khung bên trên</p>
          </div>
        ) : (
          sortedDateGroups.map((group) => {
            const groupTotal = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

            return (
              <div key={group.dateStr} className="space-y-1.5">
                
                {/* Tiêu đề nhóm ngày */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {group.dateStr}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tổng ngày: <strong className="text-rose-500">{formatMoney(groupTotal)}</strong>
                  </span>
                </div>

                {/* Các item thuộc ngày này */}
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between group ${
                          isDarkMode 
                            ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                            : 'bg-white border-slate-200/80 hover:border-indigo-200 shadow-sm'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex-1 flex flex-col space-y-2 mr-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={`w-full px-2.5 py-1 text-sm rounded-lg border outline-none ${
                                isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editAmount}
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(/\D/g, '');
                                  setEditAmount(formatCurrencyInput(rawValue));
                                }}
                                className={`w-full px-2.5 py-1 text-sm rounded-lg border outline-none ${
                                  isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className={`w-full px-2.5 py-1 text-xs rounded-lg border outline-none ${
                                  isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              >
                                {DEFAULT_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-md font-medium tracking-wide ${
                                isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {item.category || 'Khác'}
                              </span>
                            </div>
                            <h4 className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {item.title}
                            </h4>
                            <p className="text-sm font-bold text-rose-500 mt-0.5 tracking-tight">
                              -{formatMoney(item.amount)}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                title="Lưu"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors"
                                title="Hủy"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className={`p-1.5 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity ${
                                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWithConfirm(item)}
                                className="p-1.5 rounded-lg opacity-60 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 transition-opacity"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}