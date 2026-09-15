import React, { useState, useMemo } from 'react';
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
  BarChart3,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useTheme } from '../App';

// Các danh mục chi tiêu phổ biến gợi ý kèm màu sắc và mã màu biểu đồ tròn
const CATEGORY_CONFIG = {
  'Ăn uống': { color: 'from-amber-500 to-orange-600', dot: 'bg-amber-500', hex: '#f59e0b' },
  'Mua sắm': { color: 'from-pink-500 to-rose-600', dot: 'bg-pink-500', hex: '#ec4899' },
  'Hóa đơn (Điện/Nước/Net)': { color: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500', hex: '#3b82f6' },
  'Đi lại (Xăng/Xe)': { color: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500', hex: '#10b981' },
  'Giải trí': { color: 'from-purple-500 to-violet-600', dot: 'bg-purple-500', hex: '#8b5cf6' },
  'Giáo dục': { color: 'from-cyan-500 to-blue-600', dot: 'bg-cyan-500', hex: '#06b6d4' },
  'Y tế': { color: 'from-red-500 to-rose-600', dot: 'bg-red-500', hex: '#ef4444' },
  'Khác': { color: 'from-slate-500 to-zinc-600', dot: 'bg-slate-500', hex: '#64748b' }
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
  
  // State điều khiển lịch chọn ngày cho form thêm mới & chỉnh sửa
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  // State điều khiển ẩn/hiện biểu đồ & bộ lọc
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('bar'); // 'bar' hoặc 'pie'
  const [showFilter, setShowFilter] = useState(false);

  // State cho Tìm kiếm & Lọc (Search & Filter)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL'); // Định dạng 'YYYY-MM' hoặc 'ALL'

  // State cho Ngân sách tháng (Budget Alert)
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthly_expense_budget');
    return saved ? Number(saved) : 5000000; // Mặc định 5 triệu
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());

  // State hỗ trợ chức năng sửa trực tiếp trên item
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState(new Date());

  // Lưu ngân sách vào localStorage khi thay đổi
  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(tempBudget.replace(/,/g, ''));
    if (!isNaN(val) && val >= 0) {
      setMonthlyBudget(val);
      localStorage.setItem('monthly_expense_budget', val.toString());
    }
    setIsEditingBudget(false);
  };

  // Xử lý Thêm khoản chi mới (Hỗ trợ phím tắt Enter)
  const handleSubmit = (e) => {
    e?.preventDefault();
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

  // Bắt sự kiện phím Enter trên form thêm mới
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // Bắt đầu sửa khoản chi
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditAmount(formatCurrencyInput(item.amount));
    setEditCategory(item.category || DEFAULT_CATEGORIES[0]);
    setEditDate(item.date ? new Date(item.date) : new Date());
  };

  // Lưu chỉnh sửa (bao gồm cả ngày tháng)
  const handleSaveEdit = (id) => {
    const numericAmount = parseFloat(editAmount.toString().replace(/,/g, ''));
    if (!editTitle.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    if (onUpdateExpense) {
      onUpdateExpense(id, {
        title: editTitle.trim(),
        amount: numericAmount,
        category: editCategory,
        date: editDate.toISOString()
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

  // Tính tổng số tiền chi tiêu toàn bộ
  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  // Danh sách các tháng có phát sinh chi tiêu (dành cho bộ lọc tháng)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    expenses.forEach(item => {
      if (item.date) {
        const d = new Date(item.date);
        const yyyyMm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(yyyyMm);
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [expenses]);

  // Lọc danh sách chi tiêu dựa trên Tìm kiếm, Danh mục và Tháng
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'ALL' || item.category === filterCategory;

      let matchMonth = true;
      if (filterMonth !== 'ALL' && item.date) {
        const d = new Date(item.date);
        const itemYyyyMm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        matchMonth = itemYyyyMm === filterMonth;
      } else if (filterMonth !== 'ALL' && !item.date) {
        matchMonth = false;
      }

      return matchSearch && matchCategory && matchMonth;
    });
  }, [expenses, searchTerm, filterCategory, filterMonth]);

  // Thống kê tổng tiền theo từng danh mục
  const categoryStats = useMemo(() => {
    return DEFAULT_CATEGORIES.map(cat => {
      const total = expenses
        .filter(item => (item.category || 'Khác') === cat)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      return { 
        category: cat, 
        total, 
        color: CATEGORY_CONFIG[cat]?.color || 'from-slate-500 to-slate-700',
        dot: CATEGORY_CONFIG[cat]?.dot || 'bg-slate-500',
        hex: CATEGORY_CONFIG[cat]?.hex || '#64748b'
      };
    }).filter(stat => stat.total > 0);
  }, [expenses]);

  const maxCategoryTotal = Math.max(...categoryStats.map(s => s.total), 1);

  // Tính phần trăm cho biểu đồ tròn (Pie Chart conic-gradient)
  const pieGradientStyle = useMemo(() => {
    if (totalExpense === 0) return {};
    let cumulativePercent = 0;
    const gradients = categoryStats.map(stat => {
      const percent = (stat.total / totalExpense) * 100;
      const start = cumulativePercent;
      cumulativePercent += percent;
      return `${stat.hex} ${start}% ${cumulativePercent}%`;
    });
    return {
      background: `conic-gradient(${gradients.join(', ')})`
    };
  }, [categoryStats, totalExpense]);

  // Tính tỷ lệ phần trăm ngân sách đã dùng
  const budgetPercentage = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;

  // Xuất file CSV / Excel
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,Noi dung chi tieu,So tien (VND),Danh muc,Ngay\r\n";

    expenses.forEach(item => {
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '';
      const row = [
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        item.amount,
        `"${item.category || 'Khác'}"`,
        dateStr
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_chi_tieu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const formatMoney = (val) => {
    if (!val && val !== 0) return '0 đ';
    const numericVal = Number(val) || 0;
    return numericVal.toLocaleString('en-US') + ' đ';
  };

  // GOM NHÓM DANH SÁCH ĐÃ LỌC THEO NGÀY
  const groupedExpenses = useMemo(() => {
    const groups = filteredExpenses.reduce((acc, item) => {
      const dateKey = item.date ? new Date(item.date).toISOString().split('T')[0] : 'Khác';
      if (!acc[dateKey]) {
        acc[dateKey] = {
          dateStr: item.date ? new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Ngày khác',
          rawDate: item.date ? new Date(item.date) : new Date(0),
          items: []
        };
      }
      acc[dateKey].items.push(item);
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => b.rawDate - a.rawDate);
  }, [filteredExpenses]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 py-2">
      
      {/* THẺ TỔNG QUAN & CÔNG CỤ (ĐÃ GIẢM CHIỀU CAO GỌN GÀNG) */}
      <div className={`px-3.5 py-2.5 rounded-xl mb-2.5 border shadow-sm transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-800 text-slate-100' 
          : 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-100 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Tổng chi tiêu
              </p>
              <h2 className="text-xl font-bold tracking-tight leading-tight">
                {formatMoney(totalExpense)}
              </h2>
            </div>
          </div>

          {/* Cụm các nút công cụ phụ: Lọc, Biểu đồ, Xuất Excel */}
          <div className="flex items-center space-x-1.5 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setShowFilter(prev => !prev)}
              title="Lọc và Tìm kiếm"
              className={`p-1.5 rounded-lg border transition-all ${
                showFilter || searchTerm || filterCategory !== 'ALL' || filterMonth !== 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                    : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowChart(prev => !prev)}
              title="Biểu đồ phân tích"
              className={`p-1.5 rounded-lg border transition-all ${
                showChart
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                    : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              title="Xuất file CSV"
              className={`p-1.5 rounded-lg border transition-all ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                  : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DÒNG HẠN MỨC NGÂN SÁCH & CẢNH BÁO */}
        <div className="mt-2 pt-2 border-t border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Hạn mức tháng: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{formatMoney(monthlyBudget)}</strong>
            </span>
            <button 
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="text-[11px] text-indigo-500 hover:underline flex items-center space-x-0.5 font-medium"
            >
              <Settings className="w-3 h-3" />
              <span>{isEditingBudget ? 'Đóng' : 'Đặt hạn mức mới'}</span>
            </button>
          </div>

          {/* Cảnh báo vượt ngân sách */}
          {budgetPercentage >= 80 && (
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border animate-pulse ${
              budgetPercentage >= 100 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}>
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span>Đã dùng {budgetPercentage}% hạn mức!</span>
            </div>
          )}
        </div>

        {/* Modal/Form chỉnh sửa hạn mức ngân sách nhanh */}
        {isEditingBudget && (
          <form onSubmit={handleSaveBudget} className="mt-2 pt-2 border-t border-indigo-500/10 flex items-center space-x-2">
            <span className="text-xs font-medium">Nhập hạn mức mới (VNĐ):</span>
            <input
              type="text"
              value={formatCurrencyInput(tempBudget)}
              onChange={(e) => setTempBudget(e.target.value.replace(/\D/g, ''))}
              className={`px-2 py-1 text-xs rounded-lg border outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              placeholder="Nhập số tiền..."
            />
            <button type="submit" className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500">
              Lưu
            </button>
            <button type="button" onClick={() => setIsEditingBudget(false)} className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-lg text-xs">
              Hủy
            </button>
          </form>
        )}
      </div>

      {/* THANH TÌM KIẾM VÀ BỘ LỌC (FILTER & SEARCH PANEL) */}
      {showFilter && (
        <div className={`p-3 rounded-xl border mb-2.5 shadow-sm animate-fadeIn transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Bộ lọc & Tìm kiếm nâng cao
            </span>
            {(searchTerm || filterCategory !== 'ALL' || filterMonth !== 'ALL') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterCategory('ALL'); setFilterMonth('ALL'); }}
                className="text-xs text-rose-500 hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative flex items-center">
              <Search className={`absolute left-2.5 w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên khoản chi..."
                className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">Tất cả danh mục</option>
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">Tất cả các tháng</option>
              {availableMonths.map(m => {
                const [y, mm] = m.split('-');
                return <option key={m} value={m}>Tháng {mm}/{y}</option>;
              })}
            </select>
          </div>
        </div>
      )}

      {/* KHU VỰC BIỂU ĐỒ (CỘT & TRÒN) */}
      {showChart && (
        <div className={`p-3 rounded-xl border mb-2.5 shadow-sm animate-fadeIn transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <BarChart3 className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Phân tích tỷ trọng chi tiêu
              </span>
            </div>

            <div className="flex items-center space-x-1 bg-slate-500/10 p-0.5 rounded-lg">
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                  chartType === 'bar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cột
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                  chartType === 'pie' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tròn (%)
              </button>
            </div>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              Chưa có dữ liệu chi tiêu để hiển thị biểu đồ.
            </div>
          ) : chartType === 'bar' ? (
            <div className="flex items-end justify-between gap-2 h-36 pt-5 px-1">
              {categoryStats.map((stat) => {
                const heightPercent = Math.max(Math.round((stat.total / maxCategoryTotal) * 100), 18);
                
                return (
                  <div key={stat.category} className="flex-1 flex flex-col items-center h-full justify-end group/bar relative">
                    <span className={`text-[9px] font-bold mb-1 truncate max-w-full tracking-tight ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      {formatShortMoney(stat.total)}
                    </span>

                    <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl pointer-events-none whitespace-nowrap z-20 border border-slate-700">
                      <span className="font-semibold">{stat.category}</span>: {formatMoney(stat.total)}
                    </div>

                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] bg-gradient-to-t ${stat.color} transition-all duration-500 shadow-sm group-hover/bar:brightness-110`}
                    />
                    
                    <div className="flex items-center justify-center space-x-1 mt-1.5 w-full">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stat.dot}`} />
                      <span 
                        className={`text-[9px] leading-tight text-center line-clamp-2 ${
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
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around py-2 gap-3">
              <div className="relative w-32 h-32 rounded-full shadow-inner flex items-center justify-center" style={pieGradientStyle}>
                <div className={`w-18 h-18 rounded-full flex flex-col items-center justify-center shadow-md ${
                  isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
                }`}>
                  <span className="text-[9px] text-slate-400 uppercase">Tổng</span>
                  <span className="text-[11px] font-bold">{formatShortMoney(totalExpense)}</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {categoryStats.map(stat => {
                  const percent = totalExpense > 0 ? ((stat.total / totalExpense) * 100).toFixed(1) : 0;
                  return (
                    <div key={stat.category} className="flex items-center justify-between text-[11px] p-1 rounded-lg bg-slate-500/5">
                      <div className="flex items-center space-x-1.5 truncate mr-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stat.dot}`} />
                        <span className="truncate" title={stat.category}>{stat.category}</span>
                      </div>
                      <span className="font-semibold whitespace-nowrap">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM NHẬP KHOẢN CHI TIÊU MỚI */}
      <form 
        onSubmit={handleSubmit} 
        onKeyDown={handleFormKeyDown}
        className={`p-2.5 rounded-xl border mb-2.5 shadow-sm transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="space-y-2">
          <div className="relative flex items-center">
            <Tag className={`absolute left-2.5 w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập nội dung chi tiêu (Nhấn Enter để thêm nhanh)..."
              className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative flex items-center">
              <DollarSign className={`absolute left-2.5 w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={formatCurrencyInput(amount)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  setAmount(rawValue);
                }}
                placeholder="Số tiền (VNĐ)"
                className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                }`}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(prev => !prev)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>{date.toLocaleDateString('vi-VN')}</span>
              </button>

              {showDatePicker && (
                <div className="absolute left-0 top-full mt-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-white dark:bg-slate-900">
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
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${
                !title.trim() || !amount
                  ? 'bg-indigo-400/50 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-500/25'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm khoản chi</span>
            </button>
          </div>
        </div>
      </form>

      {/* DANH SÁCH CÁC KHOẢN CHI TIÊU GOM NHÓM THEO NGÀY */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredExpenses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60">
            <PieChart className="w-10 h-10 mb-2 text-slate-400 stroke-1" />
            <p className="text-xs font-medium">Không tìm thấy khoản chi tiêu nào phù hợp</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        ) : (
          groupedExpenses.map((group) => {
            const groupTotal = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

            return (
              <div key={group.dateStr} className="space-y-1">
                
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className={`w-3 h-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {group.dateStr}
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tổng ngày: <strong className="text-rose-500">{formatMoney(groupTotal)}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                          isDarkMode 
                            ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                            : 'bg-white border-slate-200/80 hover:border-indigo-200 shadow-sm'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex-1 flex flex-col space-y-1.5 mr-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={`w-full px-2 py-1 text-xs rounded-lg border outline-none ${
                                isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />
                            <div className="grid grid-cols-3 gap-1.5">
                              <input
                                type="text"
                                value={editAmount}
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(/\D/g, '');
                                  setEditAmount(formatCurrencyInput(rawValue));
                                }}
                                className={`w-full px-2 py-1 text-xs rounded-lg border outline-none ${
                                  isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className={`w-full px-2 py-1 text-[11px] rounded-lg border outline-none ${
                                  isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              >
                                {DEFAULT_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowEditDatePicker(prev => !prev)}
                                  className={`w-full px-2 py-1 text-[11px] rounded-lg border flex items-center justify-between ${
                                    isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                                  }`}
                                >
                                  <span>{editDate.toLocaleDateString('vi-VN')}</span>
                                  <Calendar className="w-2.5 h-2.5 text-indigo-500" />
                                </button>
                                {showEditDatePicker && (
                                  <div className="absolute right-0 top-full mt-1 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-white dark:bg-slate-900">
                                    <DatePicker
                                      selected={editDate}
                                      onChange={(d) => {
                                        setEditDate(d);
                                        setShowEditDatePicker(false);
                                      }}
                                      inline
                                      locale="vi"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium tracking-wide ${
                                isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {item.category || 'Khác'}
                              </span>
                            </div>
                            <h4 className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {item.title}
                            </h4>
                            <p className="text-xs font-bold text-rose-500 mt-0.2 tracking-tight">
                              -{formatMoney(item.amount)}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                title="Lưu"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors"
                                title="Hủy"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className={`p-1 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity ${
                                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteWithConfirm(item)}
                                className="p-1 rounded-lg opacity-60 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 transition-opacity"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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