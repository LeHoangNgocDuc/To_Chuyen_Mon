
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, DocStatus, Document } from '../types';
import { SCRIPT_URL } from '../constants';

interface DocumentPageProps {
  user: User;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<'Đề cương' | 'Đề thi'>('Đề cương');
  const [filterType, setFilterType] = useState<string>('Tất cả');
  const [docs, setDocs] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    if (!formData.title) return alert('Vui lòng nhập tiêu đề tài liệu!');
    if (!selectedFile) return alert('Vui lòng đính kèm tệp tài liệu!');
    
    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    const uploadData = new FormData();
    
    // Đóng gói dữ liệu binary
    uploadData.append('file', selectedFile);
    uploadData.append('type', 'documents');
    uploadData.append('action', 'save');
    uploadData.append('metadata', JSON.stringify({
      id: `doc-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      type: formData.type,
      grade: formData.grade,
      authorId: user.id,
      authorName: user.name,
      status: DocStatus.Draft,
      uploadDate: new Date().toLocaleDateString('vi-VN'),
      fileSize: selectedFile.size,
      fileMime: selectedFile.type
    }));

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      // Vì fetch POST tới GAS có thể bị CORS chặn response nhưng vẫn thành công
      setIsUploading(false);
      setShowUpload(false);
      setSelectedFile(null);
      alert('Đã gửi yêu cầu tải lên Drive! Vui lòng làm mới danh sách sau vài giây.');
      fetchDocs();
    });

    xhr.addEventListener('error', () => {
      alert('Lỗi kết nối khi tải file!');
      setIsUploading(false);
    });

    xhr.open('POST', SCRIPT_URL);
    xhr.send(uploadData);
  };

  const filteredDocs = docs.filter(d => 
    d.category === activeCategory && 
    (filterType === 'Tất cả' || d.type === filterType)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic">Kho Học Liệu Số</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Đồng bộ trực tiếp Google Drive • Hệ thống Trần Hưng Đạo</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ ...formData, category: activeCategory });
            setShowUpload(true);
          }}
          className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
        >
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </div>
          Đăng tải {activeCategory}
        </button>
      </div>

      <div className="bg-white p-2 rounded-[2.8rem] border border-slate-100 shadow-sm flex items-center w-fit">
        <button 
          onClick={() => setActiveCategory('Đề cương')}
          className={`px-12 py-4 rounded-[2.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === 'Đề cương' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Đề cương ôn tập
        </button>
        <button 
          onClick={() => setActiveCategory('Đề thi')}
          className={`px-12 py-4 rounded-[2.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === 'Đề thi' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Đề thi & Ma trận
        </button>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          {['Tất cả', 'GKI', 'CKI', 'GKII', 'CKII'].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-tighter ${
                filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
               <span className="font-black text-slate-300 uppercase italic text-sm">Đang quét dữ liệu Drive...</span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                  <th className="p-10 w-1/3">Tài liệu</th>
                  <th className="p-10 text-center">Kích thước</th>
                  <th className="p-10">Tác giả</th>
                  <th className="p-10">Duyệt</th>
                  <th className="p-10 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                  <tr key={doc.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-6 transition-transform ${
                          doc.category === 'Đề thi' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-base group-hover:text-blue-600 transition-colors">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{doc.type} • KHỐI {doc.grade}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-10 text-center">
                       <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black">{formatFileSize(doc.fileSize)}</span>
                    </td>
                    <td className="p-10">
                       <div className="text-sm font-black text-slate-700">{doc.authorName || 'GV Tổ'}</div>
                       <div className="text-[9px] text-slate-400 font-bold uppercase">{doc.uploadDate}</div>
                    </td>
                    <td className="p-10">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${
                        doc.status === DocStatus.Approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${doc.status === DocStatus.Approved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                        <span className="text-[9px] font-black uppercase">{doc.status}</span>
                      </div>
                    </td>
                    <td className="p-10 text-right">
                       <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-12 h-12 bg-white border border-slate-200 text-slate-800 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                       </a>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                       <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                       <span className="font-black text-2xl uppercase italic">Thư mục trống</span>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6 overflow-y-auto">
           <div className="bg-white rounded-[4.5rem] shadow-2xl max-w-xl w-full p-12 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic">Cổng đẩy dữ liệu Drive</h3>
                <button onClick={() => !isUploading && setShowUpload(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest">Tiêu đề tài liệu</label>
                   <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-[1.8rem] p-6 text-sm font-bold outline-none transition-all" placeholder="VD: Đề cương Toán 9 HK I" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest">Kỳ thi</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none">
                       <option value="GKI">Giữa HK I</option>
                       <option value="CKI">Cuối HK I</option>
                       <option value="GKII">Giữa HK II</option>
                       <option value="CKII">Cuối HK II</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest">Khối lớp</label>
                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none">
                       {[6,7,8,9].map(g => <option key={g} value={g}>Khối {g}</option>)}
                    </select>
                  </div>
                </div>
                
                <div 
                   onClick={() => !isUploading && fileInputRef.current?.click()}
                   className={`group p-12 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all ${
                     selectedFile ? 'border-blue-400 bg-blue-50/30' : 'border-slate-100 bg-slate-50 hover:border-blue-200'
                   }`}
                >
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                   <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform ${selectedFile ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                   </div>
                   <div className="text-center">
                     <span className="block text-[11px] font-black text-slate-800 uppercase tracking-widest">
                       {selectedFile ? selectedFile.name : 'Chọn tệp từ máy tính'}
                     </span>
                     {selectedFile && (
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mt-1 block">
                         Kích thước: {formatFileSize(selectedFile.size)}
                       </span>
                     )}
                   </div>
                </div>

                {isUploading && (
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic animate-pulse">Đang truyền dữ liệu...</span>
                      <span className="text-2xl font-black text-slate-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 relative shadow-lg"
                        style={{ width: `${uploadProgress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-14 flex gap-6">
                {!isUploading && (
                  <button onClick={() => setShowUpload(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-[11px] hover:text-slate-900 transition-colors">Hủy bỏ</button>
                )}
                <button 
                  disabled={isUploading} 
                  onClick={handleUpload} 
                  className={`flex-1 py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${
                    isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black active:scale-95'
                  }`}
                >
                  {isUploading ? 'Vui lòng chờ...' : 'Bắt đầu tải lên'}
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default DocumentPage;
