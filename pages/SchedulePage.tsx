
import React, { useState } from 'react';
import { User, UserRole, ScheduleItem } from '../types';
import { MOCK_SCHEDULE, MOCK_USERS } from '../constants';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQUquuU0405nk7Z9N5Mc7hEZ_3eu5_tr22Y7HhIqmsablt9PSulAQoj-gEbt1tYha5/exec';

interface SchedulePageProps {
  user: User;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(MOCK_SCHEDULE);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSession, setActiveSession] = useState<'Morning' | 'Afternoon'>('Morning');

  const [newEntry, setNewEntry] = useState<Partial<ScheduleItem>>({
    dayOfWeek: 2,
    period: 1,
    session: 'Morning',
    teacherId: user.id,
    className: '',
    subject: 'Toán'
  });

  const getScheduleFor = (day: number, period: number, session: 'Morning' | 'Afternoon') => {
    return schedule.find(s => s.dayOfWeek === day && s.period === period && s.session === session);
  };

  const handleSaveSchedule = async () => {
    setIsSyncing(true);
    const dataToSave = { ...newEntry, id: `sch-${Date.now()}` };
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'schedule', data: dataToSave })
      });
      setSchedule([...schedule, dataToSave as ScheduleItem]);
      alert('Đã cập nhật lịch dạy mới!');
      setShowAdjustModal(false);
    } catch (e) {
      alert('Lỗi khi lưu lịch dạy!');
    } finally {
      setIsSyncing(false);
    }
  };

  const days = [2, 3, 4, 5, 6, 7];
  const periods = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thời khóa biểu</h1>
          <div className="flex gap-4 mt-1">
             <button onClick={() => setActiveSession('Morning')} className={`text-[10px] font-black uppercase tracking-widest ${activeSession === 'Morning' ? 'text-blue-600 underline' : 'text-slate-400'}`}>Buổi Sáng</button>
             <button onClick={() => setActiveSession('Afternoon')} className={`text-[10px] font-black uppercase tracking-widest ${activeSession === 'Afternoon' ? 'text-orange-600 underline' : 'text-slate-400'}`}>Buổi Chiều</button>
          </div>
        </div>
        <div className="flex gap-2">
          {user.role === UserRole.TCM && (
            <button 
              onClick={() => setShowAdjustModal(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20"
            >
              Điều chỉnh lịch
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-4 w-24 border-r border-slate-100">Tiết</th>
                {days.map(d => <th key={d} className="p-4 border-r border-slate-100">Thứ {d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periods.map(p => (
                <tr key={p} className="h-20">
                  <td className="p-4 bg-slate-50/30 border-r border-slate-100 text-center font-black text-slate-400 text-xs">Tiết {p}</td>
                  {days.map(d => {
                    const item = getScheduleFor(d, p, activeSession);
                    const teacher = MOCK_USERS.find(u => u.id === item?.teacherId);
                    return (
                      <td key={d} className="p-1 border-r border-slate-100">
                        {item ? (
                          <div className={`h-full w-full p-2 rounded-xl border flex flex-col justify-center ${activeSession === 'Morning' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                            <div className="font-black text-xs">{item.className}</div>
                            <div className="text-[10px] font-bold opacity-60">{item.subject}</div>
                            <div className="text-[9px] font-black uppercase mt-1 opacity-40">{teacher?.name}</div>
                          </div>
                        ) : <div className="h-full w-full border border-dashed border-slate-100 rounded-xl" />}
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
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase">Điều chỉnh lịch dạy</h3>
            <div className="space-y-4">
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Lớp dạy</label>
                  <input type="text" value={newEntry.className} onChange={e => setNewEntry({...newEntry, className: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" placeholder="VD: 9/1" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Giáo viên</label>
                <select value={newEntry.teacherId} onChange={e => setNewEntry({...newEntry, teacherId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                  {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowAdjustModal(false)} className="flex-1 font-black text-slate-400 uppercase">Hủy</button>
              <button disabled={isSyncing} onClick={handleSaveSchedule} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Ghi dữ liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
