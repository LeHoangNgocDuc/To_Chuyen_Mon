
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

      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit mb-6">
        <button 
          onClick={() => setActiveCategory('Đề cương')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'Đề cương' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Đề cương (6-9 nội dung)
        </button>
        <button 
          onClick={() => setActiveCategory('Đề thi')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'Đề thi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Đề kiểm tra & Ma trận
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Tất cả', 'GKI', 'CKI', 'GKII', 'CKII'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === type ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Tìm tên tài liệu, GV..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <svg className="w-5 h-5 text-slate-300 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                <th className="p-4">Tài liệu</th>
                <th className="p-4">Thông tin</th>
                <th className="p-4">Trạng thái</th>
                {activeCategory === 'Đề thi' && <th className="p-4">Phản biện/Duyệt</th>}
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.map(doc => {
                const author = MOCK_USERS.find(u => u.id === doc.authorId);
                return (
                  <tr key={doc.id} className="text-sm hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                          doc.status === DocStatus.Approved ? 'bg-green-500' :
                          doc.status === DocStatus.NeedsEdit ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{doc.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{doc.type}</span>
                            <span className="text-[10px] text-slate-400">Nộp: {doc.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 font-semibold">{author?.name}</div>
                      <div className="text-xs text-slate-400">Lớp {doc.grade} • {author?.subject}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          doc.status === DocStatus.Approved ? 'bg-green-50 text-green-700 border-green-200' :
                          doc.status === DocStatus.Draft ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {doc.status.toUpperCase()}
                        </span>
                        {doc.isSpecialNeeds && (
                          <span className="inline-flex w-fit bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-purple-200 uppercase">
                            ♿ Hỗ trợ HSKT
                          </span>
                        )}
                      </div>
                    </td>
                    {activeCategory === 'Đề thi' && (
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">PB:</span>
                            <span className="text-slate-600 font-medium italic">Lê Văn C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Duyệt:</span>
                            {doc.status === DocStatus.Approved ? (
                              <span className="text-green-600 font-bold">TCM Đã duyệt</span>
                            ) : (
                              <span className="text-slate-400 italic">Đang chờ...</span>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Xem tài liệu">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {isTCM && (
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Duyệt nhanh">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors" title="Tải xuống">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-medium">Không tìm thấy tài liệu phù hợp</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
        <div className="space-y-2">
          <h3 className="text-xl font-bold italic">"Công tác ra đề là then chốt của đánh giá chất lượng"</h3>
          <p className="text-blue-100 text-sm opacity-80">Yêu cầu giáo viên nộp đề đúng hạn, kèm theo ma trận và bảng đặc tả chi tiết.</p>
        </div>
        <div className="flex -space-x-3">
          {MOCK_USERS.map((u, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-blue-400">
              {u.name.split(' ').pop()?.[0]}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-white/20 flex items-center justify-center text-white font-bold text-xs backdrop-blur-sm">
            +
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
