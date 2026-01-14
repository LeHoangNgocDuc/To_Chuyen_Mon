
import React, { useState, useEffect } from 'react';
import { User, UserRole, DocStatus, Document } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJYsC2pw7Dnp88JVzPLs5CwhrUwaUnd8_BgRNHOTivzsNQ93lcdUxS1_JdH1a4JTW6/exec';

interface DocumentPageProps {
  user: User;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<'Đề cương' | 'Đề thi'>('Đề cương');
  const [filterType, setFilterType] = useState<string>('Tất cả');
  const [docs, setDocs] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    type: 'GKI',
    grade: 6,
    category: 'Đề cương' as 'Đề cương' | 'Đề thi'
  });

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?type=documents`);
      const data = await res.json();
      if (Array.isArray(data)) setDocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async () => {
    if (!formData.title) return alert('Vui lòng nhập tiêu đề tài liệu!');
    setIsUploading(true);
    const newDoc: Document = {
      ...formData,
      id: `doc-${Date.now()}`,
      authorId: user.id,
      status: DocStatus.Draft,
      uploadDate: new Date().toLocaleDateString('vi-VN')
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'documents', action: 'save', data: newDoc })
      });
      alert('Đã tải tài liệu lên hệ thống! Chờ phê duyệt.');
      setShowUpload(false);
      fetchDocs();
    } catch (e) {
      alert('Lỗi tải lên!');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = docs.filter(d => 
    d.category === activeCategory && 
    (filterType === 'Tất cả' || d.type === filterType)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic">Hồ sơ Chuyên môn</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Quản lý Đề cương ôn tập và Đề kiểm tra định kỳ</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ ...formData, category: activeCategory });
            setShowUpload(true);
          }}
          className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Tải lên {activeCategory}
        </button>
      </div>

      <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center w-fit">
        <button 
          onClick={() => setActiveCategory('Đề cương')}
          className={`px-10 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === 'Đề cương' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Đề cương
        </button>
        <button 
          onClick={() => setActiveCategory('Đề thi')}
          className={`px-10 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === 'Đề thi' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Đề thi & Ma trận
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[400px]">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['Tất cả', 'GKI', 'CKI', 'GKII', 'CKII'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all uppercase ${
                  filterType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase italic">Đang đồng bộ hồ sơ...</div> : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                  <th className="p-10">Tên tài liệu / Thông tin</th>
                  <th className="p-10">Khối lớp / Môn</th>
                  <th className="p-10">Kiểm duyệt</th>
                  <th className="p-10 text-right">Tải về</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                  <tr key={doc.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${
                          doc.status === DocStatus.Approved ? 'bg-emerald-500 shadow-emerald-500/20' :
                          doc.status === DocStatus.NeedsEdit ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-500 shadow-blue-500/20'
                        }`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-base">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{doc.type} <span className="mx-1">•</span> Ngày nộp: {doc.uploadDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-10">
                       <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Khối {doc.grade}</span>
                    </td>
                    <td className="p-10">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${
                        doc.status === DocStatus.Approved ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                        doc.status === DocStatus.Draft ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' : 'bg-red-50 text-red-700 border-red-100 shadow-sm'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-10 text-right">
                       <button className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-20 text-center font-black text-slate-300 italic uppercase">Chưa có tài liệu nào trong thư mục này</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl flex items-center justify-center z-50 p-6">
           <div className="bg-white rounded-[4rem] shadow-2xl max-w-xl w-full p-12 animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic">Tải lên {formData.category}</h3>
              <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tiêu đề tài liệu</label>
                   <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="VD: Đề cương ôn tập Toán 9 Học kỳ I" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Kỳ thi / Giai đoạn</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                       <option value="GKI">Giữa học kỳ I</option>
                       <option value="CKI">Cuối học kỳ I</option>
                       <option value="GKII">Giữa học kỳ II</option>
                       <option value="CKII">Cuối học kỳ II</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Khối lớp</label>
                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                       {[6,7,8,9].map(g => <option key={g} value={g}>Khối {g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-blue-400 transition-all">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-all">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhấn để chọn tệp tài liệu</span>
                </div>
              </div>
              <div className="mt-12 flex gap-4">
                <button onClick={() => setShowUpload(false)} className="flex-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hủy bỏ</button>
                <button disabled={isUploading} onClick={handleUpload} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                  {isUploading ? 'Đang gửi...' : 'Xác nhận tải lên'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPage;
