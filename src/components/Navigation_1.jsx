import React from 'react';

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-slate-950 border-t border-slate-800 h-16 flex items-center justify-center gap-20 z-20 shrink-0">
      <button 
        onClick={() => setActiveTab('log')}
        className={`flex flex-col items-center justify-center space-y-1 w-20 py-2 rounded-xl transition-colors cursor-pointer ${activeTab === 'log' ? 'text-white bg-slate-900/60' : 'text-slate-300 hover:text-white hover:bg-slate-900/30'}`}
      >
        <span className="text-xl">📝</span>
        <span className="text-[10px]">Nhật ký</span>
      </button>
      <button 
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center justify-center space-y-1 w-20 py-2 rounded-xl transition-colors cursor-pointer ${activeTab === 'stats' ? 'text-white bg-slate-900/60' : 'text-slate-300 hover:text-white hover:bg-slate-900/30'}`}
      >
        <span className="text-xl">📊</span>
        <span className="text-[10px]">Thống kê</span>
      </button>
    </nav>
  );
}