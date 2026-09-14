import React from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export default function StatsTab({ tasks, selectedMonth }) {
  const completedTasks = tasks.filter(t => t.done || t.completed);
  const completedCount = completedTasks.length;
  const pendingCount = tasks.length - completedCount;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // 🛠️ Hàm định dạng chuẩn bắt buộc kiểu dd/mm/yyyy, hỗ trợ đúng chuẩn chuỗi "DD-MM-YYYY"
  const formatDDMMYYYY = (val, allowEmpty = false) => {
    if (!val) return allowEmpty ? "" : "—";
    
    // Nếu dữ liệu dạng chuỗi chứa dấu gạch ngang (VD: "07-09-2026" hoặc "2026-09-07")
    if (typeof val === 'string' && val.includes('-')) {
      const parts = val.split('T')[0].split('-');
      if (parts.length === 3) {
        // Nếu phần đầu là năm (4 chữ số): dạng YYYY-MM-DD
        if (parts[0].length === 4) {
          const [year, month, day] = parts;
          return `${day}/${month}/${year}`;
        } 
        // Nếu phần đầu là ngày (2 chữ số): dạng DD-MM-YYYY
        else {
          const [day, month, year] = parts;
          return `${day}/${month}/${year}`;
        }
      }
    }

    // Nếu dữ liệu đã là chuỗi dạng "DD/MM/YYYY"
    if (typeof val === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      return val;
    }

    // Trường hợp là đối tượng Date hoặc timestamp số
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return allowEmpty ? "" : String(val);
  };

  // 📄 Hàm xuất file Word chuyên nghiệp (Xuất tất cả công việc, việc chưa xong để trống hẳn cột ngày hoàn thành)
  const handleExportWord = async () => {
    if (tasks.length === 0) {
      alert("Chưa có công việc nào trong hệ thống để xuất báo cáo!");
      return;
    }

    const monthStr = selectedMonth ? `${selectedMonth.getMonth() + 1}/${selectedMonth.getFullYear()}` : '';

    // Tạo các dòng cho bảng trong Word
    const tableRows = [
      // Dòng tiêu đề của bảng
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STT", bold: true })], alignment: AlignmentType.CENTER })], width: { size: 8, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tên công việc", bold: true })], alignment: AlignmentType.CENTER })], width: { size: 44, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ngày bắt đầu", bold: true })], alignment: AlignmentType.CENTER })], width: { size: 16, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ngày kết thúc", bold: true })], alignment: AlignmentType.CENTER })], width: { size: 16, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ngày hoàn thành", bold: true })], alignment: AlignmentType.CENTER })], width: { size: 16, type: WidthType.PERCENTAGE } }),
        ],
      }),
      // Các dòng dữ liệu tất cả công việc
      ...tasks.map((t, index) => {
        const fromVal = t.fromDate || t.from || t.startDate || t.start;
        const toVal = t.toDate || t.to || t.endDate || t.end;
        
        // Kiểm tra trạng thái hoàn thành
        const isDone = t.done || t.completed;
        
        // Nếu chưa hoàn thành -> Trả về chuỗi rỗng để ô trống hoàn toàn
        const doneVal = isDone ? (t.completedAt || t.doneDate || t.dueDate || t.completedDate || t.updatedAt) : null;

        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun(String(index + 1))], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(t.title || '')] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(formatDDMMYYYY(fromVal))], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(formatDDMMYYYY(toVal))], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(formatDDMMYYYY(doneVal, true))], alignment: AlignmentType.CENTER })] }),
          ],
        });
      })
    ];

    // Khởi tạo tài liệu Word
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `BÁO CÁO CÔNG VIỆC THÁNG ${monthStr}`, bold: true, size: 28 })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            }
          })
        ]
      }]
    });

    // Xuất và tải file về máy
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `BaoCao_CongViec_Thang_${monthStr.replace('/', '_')}.docx`);
    alert('Đã xuất file Word thành công!');
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

      {/* Nút Xuất File Word */}
      <button 
        onClick={handleExportWord}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold p-3.5 rounded-xl shadow-sm transition active:scale-98 flex items-center justify-center space-x-2"
      >
        <span>📥 Xuất file báo cáo Word</span>
      </button>

      <div className="space-y-2">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block px-1">Chi tiết việc đã hoàn thành:</span>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 space-y-2.5 shadow-sm">
          {completedTasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-2">Chưa có công việc nào hoàn thành.</p>
          ) : (
            completedTasks.map((task, index) => {
              const fromVal = task.fromDate || task.from || task.startDate || task.start;
              const toVal = task.toDate || task.to || task.endDate || task.end;
              return (
                <div key={task.id} className={`text-xs text-slate-300 flex justify-between items-start gap-2 ${index > 0 ? 'border-t border-slate-800/60 pt-2.5' : ''}`}>
                  <span className="font-medium truncate">{index + 1}. {task.title}</span>
                  <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                    {formatDDMMYYYY(fromVal)} ➔ {formatDDMMYYYY(toVal)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}