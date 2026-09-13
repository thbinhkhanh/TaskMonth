import React from 'react';

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-slate-950 border-t border-slate-800 h-16 flex items-center justify-around z-20 shrink-0">
      <button 
        onClick={() => setActiveTab('log')}
        className={`flex flex-col items-center space-y-1 w-1/2 py-2 ${activeTab === 'log' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-400'}`}
      >
        <span className="text-xl">📝</span>
        <span className="text-[10px]">Nhật ký</span>
      </button>
      <button 
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center space-y-1 w-1/2 py-2 ${activeTab === 'stats' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-400'}`}
      >
        <span className="text-xl">📊</span>
        <span className="text-[10px]">Thống kê</span>
      </button>
    </nav>
  );
}