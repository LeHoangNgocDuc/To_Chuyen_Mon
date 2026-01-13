
import React, { useState, useEffect } from 'react';
import { User, UserRole, ScheduleItem } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJYsC2pw7Dnp88JVzPLs5CwhrUwaUnd8_BgRNHOTivzsNQ93lcdUxS1_JdH1a4JTW6/exec';

interface SchedulePageProps {
  user: User;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSession, setActiveSession] = useState<'Morning' | 'Afternoon'>('Morning');

  const [newEntry, setNewEntry] = useState<Partial<ScheduleItem>>({
    dayOfWeek: 2,
    period: 1,
    session: 'Morning',
    teacherId: user.id,
    className: user.assignedClasses?.[0] || '',
    subject: user.subject
  });

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?type=schedule`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSchedule(data.filter(s => s.teacherId === user.id));
      }
    } catch (e) {
      console.error("Lỗi tải lịch dạy:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user.id]);

  const getScheduleFor = (day: number, period: number, session: 'Morning' | 'Afternoon') => {
    return schedule.find(s => s.dayOfWeek === day && s.period === period && s.session === session);
  };

  const handleSaveSchedule = async () => {
    if (!newEntry.className) {
      alert('Vui lòng chọn lớp học!');
      return;
    }
    setIsSyncing(true);
    const dataToSave = { 
      ...newEntry, 
      id: `sch-${Date.now()}-${user.id}`,
      teacherId: user.id,
      subject: user.subject
    };
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'schedule', action: 'save', data: dataToSave })
      });
      setSchedule([...schedule.filter(s => s.id !== dataToSave.id), dataToSave as ScheduleItem]);
      alert('Đã cập nhật lịch dạy cá nhân vào Sheet!');
      setShowAdjustModal(false);
    } catch (e) {
      alert('Lỗi khi lưu lịch dạy!');
    } finally {
      setIsSyncing(false);
    }
  };

  const days = [2, 3, 4, 5, 6, 7];
  const periods = [1, 2, 3, 4, 5];

  if (isLoading) {
    return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Đang đồng bộ lịch từ Sheet...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Thời khóa biểu: {user.name}</h1>
          <div className="flex gap-4 mt-4">
             <button onClick={() => setActiveSession('Morning')} className={`text-[11px] font-black uppercase tracking-widest ${activeSession === 'Morning' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Buổi Sáng</button>
             <button onClick={() => setActiveSession('Afternoon')} className={`text-[11px] font-black uppercase tracking-widest ${activeSession === 'Afternoon' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>Buổi Chiều</button>
          </div>
        </div>
        <button 
          onClick={() => {
            setNewEntry({...newEntry, className: user.assignedClasses?.[0] || ''});
            setShowAdjustModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          Thêm/Sửa Tiết Dạy
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-6 w-28 border-r">Tiết</th>
                {days.map(d => <th key={d} className="p-6 border-r">Thứ {d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periods.map(p => (
                <tr key={p} className="h-28">
                  <td className="p-6 bg-slate-50/50 border-r text-center font-black text-slate-400 text-[10px]">Tiết {p}</td>
                  {days.map(d => {
                    const item = getScheduleFor(d, p, activeSession);
                    return (
                      <td key={d} className="p-2 border-r group">
                        {item ? (
                          <div className={`h-full w-full p-4 rounded-2xl border flex flex-col justify-center items-center text-center shadow-sm ${activeSession === 'Morning' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                            <div className="font-black text-lg">{item.className}</div>
                            <div className="text-[10px] font-black uppercase opacity-60">{item.subject}</div>
                          </div>
                        ) : <div className="h-full w-full border-2 border-dashed border-slate-100 rounded-2xl group-hover:border-slate-200 transition-colors" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Cập nhật tiết dạy</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Buổi học</label>
                  <select value={newEntry.session} onChange={e => setNewEntry({...newEntry, session: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    <option value="Morning">Sáng</option>
                    <option value="Afternoon">Chiều</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Thứ</label>
                  <select value={newEntry.dayOfWeek} onChange={e => setNewEntry({...newEntry, dayOfWeek: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    {[2,3,4,5,6,7].map(d => <option key={d} value={d}>Thứ {d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tiết dạy</label>
                  <select value={newEntry.period} onChange={e => setNewEntry({...newEntry, period: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    {[1,2,3,4,5].map(p => <option key={p} value={p}>Tiết {p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Lớp học (Hồ sơ)</label>
                  <select value={newEntry.className} onChange={e => setNewEntry({...newEntry, className: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    <option value="">-- Chọn lớp --</option>
                    {user.assignedClasses?.map(c => <option key={c} value={c}>Lớp {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Môn học mặc định</label>
                <div className="w-full bg-slate-100 p-4 rounded-2xl text-slate-400 font-black text-sm">{user.subject}</div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowAdjustModal(false)} className="flex-1 font-black text-slate-400 uppercase">Đóng</button>
              <button disabled={isSyncing || !newEntry.className} onClick={handleSaveSchedule} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase shadow-xl tracking-widest disabled:opacity-50">
                {isSyncing ? 'Đang gửi...' : 'Lưu vào Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
