
import React, { useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';

/**
 * Component lịch dùng chung cho toàn bộ ứng dụng.
 *
 * Props:
 * - selected: Ngày đang chọn
 * - onChange: Hàm xử lý khi chọn ngày
 * - isOpen: Trạng thái đóng/mở lịch
 * - onToggle: Hàm đóng/mở lịch
 * - isDarkMode: Chế độ sáng/tối
 * - position: Vị trí lịch: left hoặc right
 * - className: CSS bổ sung cho nút mở lịch
 */
export default function CalendarPicker({
  selected,
  onChange,
  isOpen,
  onToggle,
  isDarkMode = false,
  position = 'left',
  className = '',
}) {
  const calendarRef = useRef(null);

  // Đóng lịch khi bấm ra ngoài
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        onToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Khi chọn ngày
  const handleChange = (date) => {
    if (date) {
      onChange(date);
    }

    onToggle(false);
  };

  return (
    <div
      ref={calendarRef}
      className={`relative ${className}`}
    >
      {/* Nút mở lịch */}
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
          isDarkMode
            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        <Calendar className="w-3 h-3 text-indigo-500" />

        <span>
          {selected
            ? selected.toLocaleDateString('vi-VN')
            : 'Chọn ngày'}
        </span>
      </button>

      {/* Lịch */}
      {isOpen && (
        <div
          className={`absolute ${
            position === 'right' ? 'right-0' : 'left-0'
          } top-full mt-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-200 bg-white`}
        >
          <DatePicker
            selected={selected}
            onChange={handleChange}
            inline
            locale="vi"
          />
        </div>
      )}
    </div>
  );
}