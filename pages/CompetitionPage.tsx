
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, TeacherScoreRow } from '../types';
import { MOCK_USERS, MOCK_SUBSTITUTES } from '../constants';

// URL chính thức từ Google Apps Script của bạn
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQUquuU0405nk7Z9N5Mc7hEZ_3eu5_tr22Y7HhIqmsablt9PSulAQoj-gEbt1tYha5/exec';

interface CompetitionPageProps {
  user: User;
}

type Period = 'HKI' | 'HKII' | 'Cả năm';

const CompetitionPage: React.FC<CompetitionPageProps> = ({ user }) => {
  const [activePeriod, setActivePeriod] = useState<Period>('HKI');
  const [viewMode, setViewMode] = useState<'Summary' | 'Excel'>('Excel');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(user.id);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Khởi tạo điểm ban đầu là 0
  const [scores, setScores] = useState<Record<string, TeacherScoreRow>>(() => {
    const initial: Record<string, TeacherScoreRow> = {};
    MOCK_USERS.forEach((u) => {
      if (u.role !== UserRole.BGH) {
        initial[u.id] = {
          teacherId: u.id,
          tt: 0, dn: 0, sh: 0, nq: 0, qt: 0,
          ga: 0, sd: 0, dg: 0, lbg: 0, tb: 0, dt_hsss: 0,
          ngc: 0, bc: 0, dt_ngaycong: 0,
          tg: 0, thct: 0, clbm: 0, dt_ctcm: 0,
          chuNhiem: 0,
          kiemNhiem: 0,
          congTacKhac: 0
        };
      }
    });
    return initial;
  });

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        const newScores: Record<string, TeacherScoreRow> = { ...scores };
        data.forEach((item: any) => {
          if (item.teacherId) {
            newScores[item.teacherId] = {
              ...item,
              ...Object.keys(item).reduce((acc: any, key) => {
                 if (key !== 'teacherId' && key !== 'teacherName' && key !== 'lastUpdated') {
                   acc[key] = parseFloat(item[key]) || 0;
                 }
                 return acc;
              }, {})
            };
          }
        });
        setScores(newScores);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ Sheet:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveScoreToSheet = async (teacherId: string) => {
    if (!isManagement && teacherId !== user.id) {
      alert("Bạn không có quyền sửa điểm của giáo viên khác!");
      return;
    }

    setIsSyncing(true);
    const scoreData = {
      ...scores[teacherId],
      teacherName: MOCK_USERS.find(u => u.id === teacherId)?.name || user.name
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });
      alert('Dữ liệu đã được lưu thành công!');
      setShowEntryModal(false);
      setTimeout(fetchScores, 1000);
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateSubstitutePoints = (teacherId: string) => {
    const approvedSubs = MOCK_SUBSTITUTES.filter(s => s.substituteTeacherId === teacherId && s.status === 'Approved');
    return approvedSubs.length * 0.25;
  };

  const isManagement = user.role === UserRole.TCM || user.role === UserRole.TP;

  const fullTableData = useMemo(() => {
    return MOCK_USERS
      .filter(u => u.role !== UserRole.BGH)
      .map(u => {
        const s = scores[u.id] || { 
          tt: 0, dn: 0, sh: 0, nq: 0, qt: 0, 
          ga: 0, sd: 0, dg: 0, lbg: 0, tb: 0, dt_hsss: 0,
          ngc: 0, bc: 0, dt_ngaycong: 0,
          tg: 0, thct: 0, clbm: 0, dt_ctcm: 0,
          chuNhiem: 0, kiemNhiem: 0, congTacKhac: 0
        };
        const subPoints = calculateSubstitutePoints(u.id);
        const totalA = s.tt + s.dn + s.sh + s.nq + s.qt;
        const totalHSSS = s.ga + s.sd + s.dg + s.lbg + s.tb + s.dt_hsss;
        const totalNgayCong = s.ngc + s.bc + s.dt_ngaycong + subPoints;
        const totalCTCM = s.tg + s.thct + s.clbm + s.dt_ctcm;
        const grandTotal = totalA + totalHSSS + totalNgayCong + totalCTCM + s.chuNhiem + s.kiemNhiem + s.congTacKhac;
        return { ...u, ...s, subPoints, totalA, totalHSSS, totalNgayCong, totalCTCM, grandTotal };
      })
      .sort((a, b) => b.grandTotal - a.grandTotal);
  }, [scores]);

  const handleScoreUpdate = (teacherId: string, field: keyof TeacherScoreRow, value: number) => {
    setScores(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value
      }
    }));
  };

  const currentEntryScore = scores[selectedTeacherId];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="flex gap-2 p-1 bg-slate-200 rounded-xl w-fit shadow-inner">
            <button onClick={() => setViewMode('Summary')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'Summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Tổng hợp</button>
            <button onClick={() => setViewMode('Excel')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'Excel' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Chi tiết Excel</button>
          </div>
          <button 
            onClick={() => {
              setSelectedTeacherId(user.id);
              setShowEntryModal(true);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
          >
            <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Tự nhập liệu
          </button>
        </div>
        <div className="flex items-center gap-4">
           {isSyncing && <div className="text-[10px] font-black text-blue-600 uppercase animate-pulse">Đang đồng bộ...</div>}
           <div className="flex p-1 bg-slate-200 rounded-xl">
            {(['HKI', 'HKII', 'Cả năm'] as Period[]).map(p => (
              <button key={p} onClick={() => setActivePeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activePeriod === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] font-medium leading-none table-fixed min-w-[1600px]">
            <colgroup>
              <col className="w-10" /><col className="w-40" />
              <col span={5} className="w-12" /><col className="w-14" />
              <col span={6} className="w-12" /><col className="w-14" />
              <col span={4} className="w-12" /><col className="w-14" />
              <col span={4} className="w-12" /><col className="w-14" />
              <col span={3} className="w-14" />
              <col className="w-16" /><col className="w-14" />
            </colgroup>
            <thead>
              <tr className="bg-emerald-600 text-white font-black text-[14px] text-center border-b border-white">
                <th colSpan={36} className="py-2.5 uppercase tracking-[0.2em]">TONG KET THI ĐUA {activePeriod} - TO TOAN TIN</th>
              </tr>
              <tr className="bg-slate-50 text-slate-800 text-center border-b border-slate-300">
                <th rowSpan={3} className="border-r border-slate-300">TT</th>
                <th rowSpan={3} className="border-r border-slate-300">Họ và tên</th>
                <th colSpan={6} className="p-1 border-r border-slate-300 font-black text-[11px] bg-blue-50">A. TT, CT, ĐĐ, LS</th>
                <th colSpan={21} className="p-1 border-r border-slate-300 font-black text-[11px] bg-green-50">B. Chuyên môn</th>
                <th rowSpan={3} className="border-r border-slate-300 vertical-text-header">Chủ nhiệm</th>
                <th rowSpan={3} className="border-r border-slate-300 vertical-text-header">Kiêm nhiệm</th>
                <th rowSpan={3} className="border-r border-slate-300 vertical-text-header bg-emerald-50">Thưởng (+)</th>
                <th rowSpan={3} className="bg-yellow-400 text-slate-900 font-black text-[12px] uppercase">Tổng</th>
                <th rowSpan={3} className="bg-slate-900 text-white font-black text-[12px] uppercase">Hạng</th>
              </tr>
              <tr className="bg-white text-center border-b border-slate-300 text-[8px] font-black uppercase">
                <th colSpan={5} className="border-r border-slate-200"></th>
                <th rowSpan={2} className="border-r border-slate-300 bg-blue-600 text-white vertical-text-header">Cộng</th>
                <th colSpan={6} className="p-1 border-r border-slate-300 bg-slate-100 italic">I. HSSS</th>
                <th rowSpan={2} className="border-r border-slate-300 bg-yellow-400 text-slate-900 vertical-text-header">Cộng</th>
                <th colSpan={4} className="p-1 border-r border-slate-300 bg-slate-100 italic">II. Ngày công</th>
                <th rowSpan={2} className="border-r border-slate-300 bg-blue-500 text-white vertical-text-header">Cộng</th>
                <th colSpan={4} className="p-1 border-r border-slate-300 bg-slate-100 italic">IV. CTCM</th>
                <th rowSpan={2} className="border-r border-slate-300 bg-yellow-400 text-slate-900 vertical-text-header">Cộng</th>
              </tr>
              <tr className="bg-white text-center border-b border-slate-300 text-[8px] font-black uppercase">
                <th className="p-1 border-r border-slate-200">TT</th><th className="p-1 border-r border-slate-200">ĐN</th><th className="p-1 border-r border-slate-200">SH</th><th className="p-1 border-r border-slate-200">NQ</th><th className="p-1 border-r border-slate-200">QT</th>
                <th className="p-1 border-r border-slate-200">GA</th><th className="p-1 border-r border-slate-200">SD</th><th className="p-1 border-r border-slate-200">DG</th><th className="p-1 border-r border-slate-200">LBG</th><th className="p-1 border-r border-slate-200">TB</th><th className="p-1 border-r border-slate-200 bg-red-50">ĐT</th>
                <th className="p-1 border-r border-slate-200">NGC</th><th className="p-1 border-r border-slate-200">BC</th><th className="p-1 border-r border-slate-200">DT</th><th className="p-1 border-r border-slate-200 bg-amber-50">R</th>
                <th className="p-1 border-r border-slate-200">TG</th><th className="p-1 border-r border-slate-200">THCT</th><th className="p-1 border-r border-slate-200">CLBM</th><th className="p-1 border-r border-slate-200 bg-red-50">ĐT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fullTableData.map((row, idx) => (
                <tr key={row.id} className="text-center h-9 hover:bg-slate-50 transition-colors">
                  <td className="border-r border-slate-300 font-black text-slate-300 bg-slate-50/50">{idx + 1}</td>
                  <td className="border-r border-slate-300 text-left px-3 font-black text-slate-800">{row.name}</td>
                  <td className="border-r border-slate-100 italic">{row.tt}</td><td className="border-r border-slate-100 italic">{row.dn}</td><td className="border-r border-slate-100 italic">{row.sh}</td><td className="border-r border-slate-100 italic">{row.nq}</td><td className="border-r border-slate-100 italic">{row.qt}</td>
                  <td className="border-r border-slate-300 bg-blue-600 text-white font-black">{row.totalA}</td>
                  <td className="border-r border-slate-100 italic">{row.ga}</td><td className="border-r border-slate-100 italic">{row.sd}</td><td className="border-r border-slate-100 italic">{row.dg}</td><td className="border-r border-slate-100 italic">{row.lbg}</td><td className="border-r border-slate-100 italic">{row.tb}</td>
                  <td className="border-r border-slate-200 bg-red-50 font-bold">{row.dt_hsss.toFixed(1)}</td>
                  <td className="border-r border-slate-300 bg-yellow-400 font-black text-slate-900">{row.totalHSSS.toFixed(1)}</td>
                  <td className="border-r border-slate-100 italic">{row.ngc}</td><td className="border-r border-slate-100 italic">{row.bc}</td><td className="border-r border-slate-100 italic">{row.dt_ngaycong.toFixed(1)}</td><td className="border-r border-slate-200 bg-amber-50 font-black text-amber-700">{row.subPoints}</td>
                  <td className="border-r border-slate-300 bg-blue-500 text-white font-black">{row.totalNgayCong.toFixed(1)}</td>
                  <td className="border-r border-slate-100 italic">{row.tg}</td><td className="border-r border-slate-100 italic">{row.thct}</td><td className="border-r border-slate-100 italic">{row.clbm}</td><td className="border-r border-slate-200 bg-red-50 font-bold">{row.dt_ctcm}</td>
                  <td className="border-r border-slate-300 bg-yellow-400 font-black text-slate-900">{row.totalCTCM}</td>
                  <td className="border-r border-slate-100 font-bold">{row.chuNhiem}</td><td className="border-r border-slate-100 font-bold">{row.kiemNhiem}</td><td className="border-r border-slate-300 bg-emerald-50 text-emerald-600 font-black">+{row.congTacKhac}</td>
                  <td className="border-r border-slate-300 bg-yellow-400 font-black text-slate-900 text-[11px]">{row.grandTotal.toFixed(1)}</td>
                  <td className="bg-slate-900 text-white font-black">{idx + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEntryModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Sổ nhập liệu thi đua</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Năm học 2024-2025 • Hệ thống tự động đồng bộ Sheets</p>
              </div>
              <button disabled={isSyncing} onClick={() => setShowEntryModal(false)} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-10">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black text-blue-700 uppercase w-full mb-1">
                  {isManagement ? 'Chọn GV để ghi điểm:' : 'Ghi điểm thi đua cho:'}
                </span>
                {isManagement ? (
                   MOCK_USERS.filter(u => u.role !== UserRole.BGH).map(u => (
                    <button 
                      key={u.id}
                      onClick={() => setSelectedTeacherId(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                        selectedTeacherId === u.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {u.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-blue-600 text-white shadow-md">
                    {user.name}
                  </div>
                )}
              </div>

              {/* SECTION A */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-500/20">A</span>
                  <h4 className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">TT, CT, ĐĐ, LS</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
                  {(['tt', 'dn', 'sh', 'nq', 'qt'] as const).map(field => (
                    <div key={field}>
                      <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 ml-1">{field}</label>
                      <input 
                        type="number" 
                        value={currentEntryScore[field]} 
                        onChange={(e) => handleScoreUpdate(selectedTeacherId, field, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B */}
              <div className="space-y-8 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-green-500/20">B</span>
                  <h4 className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Chuyên môn</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">I. HSSS</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {(['ga', 'sd', 'dg', 'lbg', 'tb', 'dt_hsss'] as const).map(field => (
                        <div key={field}>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 ml-1">{field === 'dt_hsss' ? 'Thưởng (+)' : field}</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={currentEntryScore[field]} 
                            onChange={(e) => handleScoreUpdate(selectedTeacherId, field, parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-black text-slate-700 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">II. Ngày công</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {(['ngc', 'bc', 'dt_ngaycong'] as const).map(field => (
                        <div key={field}>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 ml-1">{field === 'dt_ngaycong' ? 'Thưởng (+)' : field}</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={currentEntryScore[field]} 
                            onChange={(e) => handleScoreUpdate(selectedTeacherId, field, parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-black text-slate-700 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">IV. CTCM</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {(['tg', 'thct', 'clbm', 'dt_ctcm'] as const).map(field => (
                        <div key={field}>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 ml-1">{field === 'dt_ctcm' ? 'Thưởng (+)' : field}</label>
                          <input 
                            type="number" 
                            value={currentEntryScore[field]} 
                            onChange={(e) => handleScoreUpdate(selectedTeacherId, field, parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-black text-slate-700 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 ml-1">Chủ nhiệm</label>
                  <input 
                    type="number" 
                    value={currentEntryScore.chuNhiem} 
                    onChange={(e) => handleScoreUpdate(selectedTeacherId, 'chuNhiem', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-indigo-100 rounded-2xl p-4 text-base font-black text-indigo-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 ml-1">Kiêm nhiệm</label>
                  <input 
                    type="number" 
                    value={currentEntryScore.kiemNhiem} 
                    onChange={(e) => handleScoreUpdate(selectedTeacherId, 'kiemNhiem', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-indigo-100 rounded-2xl p-4 text-base font-black text-indigo-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50">
                  <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 ml-1">Công tác khác (+)</label>
                  <input 
                    type="number" 
                    value={currentEntryScore.congTacKhac} 
                    onChange={(e) => handleScoreUpdate(selectedTeacherId, 'congTacKhac', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-emerald-100 rounded-2xl p-4 text-base font-black text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
              <button disabled={isSyncing} onClick={() => setShowEntryModal(false)} className="px-8 py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Hủy bỏ</button>
              <button 
                disabled={isSyncing}
                onClick={() => saveScoreToSheet(selectedTeacherId)}
                className="bg-slate-900 text-white px-12 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                {isSyncing ? <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> : null}
                {isSyncing ? 'Đang gửi...' : 'Ghi vào Sheets'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.vertical-text-header { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding: 4px 2px; text-align: center; font-weight: 900; }`}</style>
    </div>
  );
};

export default CompetitionPage;
