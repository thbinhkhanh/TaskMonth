import React from 'react';
import { formatDateVN } from '../utils/dateUtils';

export default function StatsTab({ tasks, selectedMonth }) {
  const completedTasks = tasks.filter(t => t.done);
  const completedCount = completedTasks.length;
  const pendingCount = tasks.length - completedCount;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCopyReport = () => {
    const text = completedTasks
      .map((t, i) => `${i + 1}. ${t.title} (Từ ${formatDateVN(t.startDate)} đến ${formatDateVN(t.endDate)})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('Đã copy danh sách báo cáo chuẩn ngày Việt Nam!');
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-5">
      <h2 className="text-base font-bold text-slate-200 px-1">
        📊 Thống kê Tháng {selectedMonth ? selectedMonth.getMonth() + 1 : ''}/{selectedMonth ? selectedMonth.getFullYear() : ''}
      </h2>
      
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center shadow-md">
        <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-[6px] border-indigo-500/20 border-t-indigo-500 border-r-indigo-500 border-l-indigo-500 text-center">
          <div>
            <span className="text-2xl font-black text-indigo-400 block">{percentage}%</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hoàn thành</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full mt-5 text-center border-t pt-4 border-slate-800">
          <div className="border-r border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">✔️ Đã làm xong</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">{completedCount} việc</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">⏳ Chưa thực hiện</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">{pendingCount} việc</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleCopyReport}
        className="w-full bg-slate-900 hover:bg-slate-850 border border-indigo-500/30 text-indigo-400 text-xs font-semibold p-3.5 rounded-xl shadow-sm transition active:scale-98 flex items-center justify-center space-x-2"
      >
        <span>📋 Copy nhanh danh sách báo cáo (VN)</span>
      </button>

      <div className="space-y-2">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block px-1">Chi tiết việc đã hoàn thành:</span>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 space-y-2.5 shadow-sm">
          {completedTasks.map((task, index) => (
            <div key={task.id} className={`text-xs text-slate-300 flex justify-between items-start gap-2 ${index > 0 ? 'border-t border-slate-800/60 pt-2.5' : ''}`}>
              <span className="font-medium truncate">{index + 1}. {task.title}</span>
              <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                {formatDateVN(task.startDate)} ➔ {formatDateVN(task.endDate) || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}