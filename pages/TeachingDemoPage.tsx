
import React, { useState, useEffect } from 'react';
import { User, UserRole, TeachingDemo } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJYsC2pw7Dnp88JVzPLs5CwhrUwaUnd8_BgRNHOTivzsNQ93lcdUxS1_JdH1a4JTW6/exec';

interface TeachingDemoPageProps {
  user: User;
  users: User[];
}

const TeachingDemoPage: React.FC<TeachingDemoPageProps> = ({ user, users }) => {
  const [demos, setDemos] = useState<TeachingDemo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TeachingDemo>>({
    week: 1,
    date: new Date().toISOString().split('T')[0],
    period: 1,
    className: '',
    teacherId: user.id,
    tct: 1,
    lessonName: '',
    reporterId: '',
    note: '',
    session: 'Morning'
  });

  const fetchDemos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?type=demos`);
      const data = await response.json();
      if (Array.isArray(data)) setDemos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDemos(); }, []);

  const handleSave = async () => {
    if (!formData.lessonName || !formData.className) return alert('Vui lòng điền đủ thông tin bài dạy!');
    setIsSaving(true);
    const dataToSave = { ...formData, id: `demo-${Date.now()}` };
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'demos', action: 'save', data: dataToSave })
      });
      alert('Đăng ký thao giảng thành công!');
      setShowModal(false);
      fetchDemos();
    } catch (e) {
      alert('Lỗi khi lưu!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">Kế hoạch thao giảng</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Dành cho giáo viên tổ Toán-Tin đăng ký dạy tốt</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Đăng ký mới</button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest">
                  <th className="p-6 border-r border-white/10 w-16 text-center">STT</th>
                  <th className="p-6 border-r border-white/10 w-20 text-center">Tuần</th>
                  <th className="p-6 border-r border-white/10">Ngày dạy</th>
                  <th className="p-6 border-r border-white/10 w-20 text-center">Tiết</th>
                  <th className="p-6 border-r border-white/10 w-24 text-center">Lớp</th>
                  <th className="p-6 border-r border-white/10">GV Thao giảng</th>
                  <th className="p-6 border-r border-white/10 w-16 text-center">TCT</th>
                  <th className="p-6 border-r border-white/10">Tên bài dạy</th>
                  <th className="p-6 border-r border-white/10">GV Viết phiếu</th>
                  <th className="p-6">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={10} className="p-20 text-center font-black text-slate-300 italic animate-pulse">Đang đồng bộ dữ liệu...</td></tr>
                ) : demos.length > 0 ? demos.map((demo, idx) => (
                  <tr key={demo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 border-r border-slate-100 text-center font-black text-slate-400">{idx + 1}</td>
                    <td className="p-6 border-r border-slate-100 text-center font-black text-slate-800">{demo.week}</td>
                    <td className="p-6 border-r border-slate-100 font-bold text-slate-600 text-sm">{demo.date}</td>
                    <td className="p-6 border-r border-slate-100 text-center font-black text-blue-600">{demo.period}</td>
                    <td className="p-6 border-r border-slate-100 text-center font-black text-slate-800">{demo.className}</td>
                    <td className="p-6 border-r border-slate-100">
                       <div className="font-black text-slate-800 text-sm">{users.find(u => u.id === demo.teacherId)?.name || 'N/A'}</div>
                    </td>
                    <td className="p-6 border-r border-slate-100 text-center font-black text-slate-500">{demo.tct}</td>
                    <td className="p-6 border-r border-slate-100 font-black text-slate-800 text-sm italic">{demo.lessonName}</td>
                    <td className="p-6 border-r border-slate-100">
                       <div className="font-bold text-slate-500 text-xs">{users.find(u => u.id === demo.reporterId)?.name || '--'}</div>
                    </td>
                    <td className="p-6 text-slate-400 italic text-xs font-bold">{demo.note || '--'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={10} className="p-20 text-center font-black text-slate-300 italic uppercase">Chưa có bản đăng ký nào</td></tr>
                )}
              </tbody>
           </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl flex items-center justify-center z-50 p-6 overflow-y-auto">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full p-12 my-8 animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic">Đăng ký thao giảng</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tuần học</label>
                   <input type="number" value={formData.week} onChange={e => setFormData({...formData, week: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ngày dạy</label>
                   <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tiết dạy</label>
                   <select value={formData.period} onChange={e => setFormData({...formData, period: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                      {[1,2,3,4,5].map(p => <option key={p} value={p}>Tiết {p}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Lớp</label>
                   <input type="text" placeholder="VD: 9/1" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tên bài dạy</label>
                   <input type="text" value={formData.lessonName} onChange={e => setFormData({...formData, lessonName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" placeholder="VD: Bài toán về tỉ số phần trăm..." />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tiết CT (TCT)</label>
                   <input type="number" value={formData.tct} onChange={e => setFormData({...formData, tct: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">GV Viết phiếu</label>
                   <select value={formData.reporterId} onChange={e => setFormData({...formData, reporterId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                      <option value="">-- Chọn GV --</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                   </select>
                </div>
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ghi chú</label>
                   <textarea rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold"></textarea>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-[10px]">Hủy bỏ</button>
                <button disabled={isSaving} onClick={handleSave} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                  {isSaving ? 'Đang lưu...' : 'Lưu đăng ký'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeachingDemoPage;
