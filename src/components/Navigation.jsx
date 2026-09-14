import React from 'react';

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-slate-950 border-t border-slate-800 h-16 flex items-center justify-around z-20 shrink-0">
      <button 
        onClick={() => setActiveTab('log')}
        className={`flex flex-col items-center space-y-1 w-1/2 py-2 cursor-pointer ${activeTab === 'log' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
      >
        <span className="text-xl">📝</span>
        <span className="text-[10px]">Nhật ký</span>
      </button>
      <button 
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center space-y-1 w-1/2 py-2 cursor-pointer ${activeTab === 'stats' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
      >
        <span className="text-xl">📊</span>
        <span className="text-[10px]">Thống kê</span>
      </button>
    </nav>
  );
}