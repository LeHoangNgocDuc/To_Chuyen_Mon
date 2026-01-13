
import React, { useState } from 'react';
import { User, UserRole, DocStatus, DocType } from '../types';
import { MOCK_DOCS, MOCK_USERS } from '../constants';

interface DocumentPageProps {
  user: User;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<'Đề cương' | 'Đề thi'>('Đề cương');
  const [filterType, setFilterType] = useState<string>('Tất cả');
  const isTCM = user.role === UserRole.TCM;

  const filteredDocs = MOCK_DOCS.filter(d => 
    d.category === activeCategory && 
    (filterType === 'Tất cả' || d.type === filterType)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hồ sơ Chuyên môn</h1>
          <p className="text-slate-500">Quản lý Đề cương ôn tập và Đề kiểm tra định kỳ</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Tải lên {activeCategory}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-blue-800">
          Cấu trúc lưu trữ Drive: <span className="text-slate-500">2024-2025</span> <span className="mx-1">/</span> <span className="text-blue-600">{activeCategory}</span> <span className="mx-1">/</span> <span className="text-slate-500">Lớp {filteredDocs[0]?.grade || '...'}</span>
        </div>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveCategory('Đề cương')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'Đề cương' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Đề cương
        </button>
        <button 
          onClick={() => setActiveCategory('Đề thi')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'Đề thi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Đề thi & Ma trận
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['Tất cả', 'GKI', 'CKI', 'GKII', 'CKII'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all uppercase ${
                  filterType === type ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm tài liệu..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 w-64"
            />
            <svg className="w-5 h-5 text-slate-300 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                <th className="p-5">Hồ sơ tài liệu</th>
                <th className="p-5">Tác giả / Khối</th>
                <th className="p-5">Kiểm duyệt</th>
                <th className="p-5 text-right">Tải về</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.map(doc => {
                const author = MOCK_USERS.find(u => u.id === doc.authorId);
                return (
                  <tr key={doc.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                          doc.status === DocStatus.Approved ? 'bg-green-500 shadow-green-500/20' :
                          doc.status === DocStatus.NeedsEdit ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-500 shadow-blue-500/20'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <div className="font-black text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{doc.type} • Nộp: {doc.uploadDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-slate-700 font-black">{author?.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Lớp {doc.grade} • {author?.subject}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                        doc.status === DocStatus.Approved ? 'bg-green-50 text-green-700 border-green-100' :
                        doc.status === DocStatus.Draft ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                       <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
