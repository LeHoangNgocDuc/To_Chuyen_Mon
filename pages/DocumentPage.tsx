
import React, { useState, useEffect, useRef } from 'react';
import { User, DocStatus, Document as DocType } from '../types';
import { SCRIPT_URL, DRIVE_FOLDER_ID, GOOGLE_CLIENT_ID } from '../constants';

interface DocumentPageProps {
  user: User;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<'Đề cương' | 'Đề thi' | 'Chuyên đề'>('Đề cương');
  const [filterType, setFilterType] = useState<string>('Tất cả');
  const [docs, setDocs] = useState<DocType[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const tokenClientRef = useRef<any>(null);

  const isConfigValid = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID');

  const [formData, setFormData] = useState({
    title: '',
    type: 'GKI',
    customThematicName: '',
    grade: 6,
    category: 'Đề cương' as 'Đề cương' | 'Đề thi' | 'Chuyên đề'
  });

  useEffect(() => {
    // Khởi tạo Google Identity Services khi script đã load
    const initGis = () => {
      if ((window as any).google && isConfigValid) {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: '', 
        });
      }
    };

    if ((window as any).google) {
      initGis();
    } else {
      // Đợi script load nếu chưa có
      const interval = setInterval(() => {
        if ((window as any).google) {
          initGis();
          clearInterval(interval);
        }
      }, 500);
    }
    
    fetchDocs();
  }, [isConfigValid]);

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
    if (!isConfigValid) {
      return alert('Hệ thống chưa được cấu hình Client ID. Vui lòng cập nhật GOOGLE_CLIENT_ID trong constants.tsx để sử dụng tính năng nộp file trực tiếp.');
    }
    if (!formData.title) return alert('Vui lòng nhập tiêu đề!');
    if (formData.category === 'Chuyên đề' && !formData.customThematicName) return alert('Vui lòng nhập tên Chuyên đề!');
    if (!selectedFile) return alert('Vui lòng chọn tệp!');

    if (!tokenClientRef.current) {
      return alert('Hệ thống Google Auth đang khởi tạo, vui lòng thử lại sau giây lát!');
    }

    setIsUploading(true);
    setUploadProgress(0);

    tokenClientRef.current.callback = async (response: any) => {
      if (response.error !== undefined) {
        setIsUploading(false);
        console.error("Auth Error:", response);
        return alert('Lỗi xác thực: ' + (response.error_description || response.error));
      }
      const accessToken = response.access_token;
      startDriveUpload(accessToken);
    };

    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  };

  const startDriveUpload = async (accessToken: string) => {
    try {
      if (!selectedFile) return;

      const metadata = {
        name: selectedFile.name,
        mimeType: selectedFile.type,
        parents: [DRIVE_FOLDER_ID]
      };

      const initResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': selectedFile.type,
          'X-Upload-Content-Length': selectedFile.size.toString(),
        },
        body: JSON.stringify(metadata),
      });

      const sessionUri = initResponse.headers.get('Location');
      if (!sessionUri) throw new Error('Không lấy được Resumable Session URI');

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', sessionUri, true);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('Content-Type', selectedFile.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 90);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const driveFile = JSON.parse(xhr.responseText);
          setUploadProgress(95);
          await syncMetadataToSheet(driveFile.id);
        } else {
          setIsUploading(false);
          alert('Lỗi tải lên Drive: ' + xhr.statusText);
        }
      };

      xhr.onerror = () => {
        alert('Lỗi kết nối khi tải lên!');
        setIsUploading(false);
      };

      xhr.send(selectedFile);
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi!');
      setIsUploading(false);
    }
  };

  const syncMetadataToSheet = async (driveFileId: string) => {
    try {
      const docTypeVal = formData.category === 'Chuyên đề' ? formData.customThematicName : formData.type;
      const fileUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`;

      const payload = {
        type: 'documents',
        action: 'save',
        data: {
          id: `doc-${Date.now()}`,
          title: formData.title,
          category: formData.category,
          type: docTypeVal,
          grade: formData.grade,
          authorId: user.id,
          authorName: user.name,
          status: DocStatus.Draft,
          uploadDate: new Date().toLocaleDateString('vi-VN'),
          fileSize: selectedFile?.size,
          fileMime: selectedFile?.type,
          fileUrl: fileUrl,
          driveFileId: driveFileId
        }
      };

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setShowUpload(false);
        setSelectedFile(null);
        alert('Nộp bài thành công!');
        fetchDocs();
      }, 500);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  const filteredDocs = docs.filter(d => 
    d.category === activeCategory && 
    (filterType === 'Tất cả' || d.type === filterType)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {!isConfigValid && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-start gap-4 shadow-sm animate-pulse">
           <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <div>
              <h4 className="font-black text-amber-800 uppercase italic text-sm">Cảnh báo: Hệ thống chưa cấu hình Direct-Drive</h4>
              <p className="text-[11px] text-amber-600 font-bold mt-1">Vui lòng cập nhật GOOGLE_CLIENT_ID trong file constants.tsx để nộp file không bị lỗi 401.</p>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">Thư viện Học liệu</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Tổ Toán - Tin | Hệ thống lưu trữ Direct-Drive</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ ...formData, category: activeCategory });
            setShowUpload(true);
          }}
          className="bg-indigo-600 text-white px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
        >
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </div>
          Nộp {activeCategory}
        </button>
      </div>

      <div className="bg-white p-2 rounded-[2.8rem] border border-slate-100 shadow-sm flex items-center w-fit overflow-x-auto max-w-full">
        {['Đề cương', 'Đề thi', 'Chuyên đề'].map((cat: any) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-10 py-4 rounded-[2.2rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[500px]">
        {activeCategory !== 'Chuyên đề' && (
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-3 items-center">
            {['Tất cả', 'GKI', 'CKI', 'GKII', 'CKII', 'HÈ'].map(type => (
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
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <span className="font-black text-slate-300 uppercase italic text-sm">Đang quét Drive...</span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                  <th className="p-10 w-1/3">Hồ sơ</th>
                  <th className="p-10 text-center">Phân loại / Khối</th>
                  <th className="p-10">Người nộp</th>
                  <th className="p-10">Trạng thái</th>
                  <th className="p-10 text-right">Tải về</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                  <tr key={doc.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-6 transition-transform ${
                          doc.category === 'Đề thi' ? 'bg-rose-500' : doc.category === 'Chuyên đề' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{doc.type} • {doc.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-10 text-center">
                       <div className="text-sm font-black text-slate-700">KHỐI {doc.grade}</div>
                       <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{formatFileSize(doc.fileSize)}</div>
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
                       {doc.fileUrl ? (
                         <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-12 h-12 bg-white border border-slate-200 text-slate-800 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         </a>
                       ) : (
                         <span className="text-[9px] font-black text-slate-300 uppercase italic">Xử lý Drive...</span>
                       )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center opacity-10">
                       <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                       <span className="font-black text-2xl uppercase italic tracking-tighter">Thư mục hiện tại trống</span>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center z-50 p-6 overflow-y-auto">
           <div className="bg-white rounded-[4.5rem] shadow-2xl max-w-xl w-full p-12 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Nộp bài trực tiếp Drive</h3>
                <button onClick={() => !isUploading && setShowUpload(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest italic">Tên bài học / Tiêu đề hồ sơ</label>
                   <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-[1.8rem] p-6 text-sm font-bold outline-none transition-all shadow-inner" placeholder="VD: Ôn tập Đại số 9 HK I" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest italic">
                      {formData.category === 'Chuyên đề' ? 'Tên Chuyên đề' : 'Giai đoạn'}
                    </label>
                    {formData.category === 'Chuyên đề' ? (
                      <input 
                        type="text" 
                        value={formData.customThematicName} 
                        onChange={e => setFormData({...formData, customThematicName: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none shadow-inner focus:border-indigo-500" 
                        placeholder="Nhập tên chuyên đề..."
                      />
                    ) : (
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none shadow-inner">
                         <option value="GKI">Giữa HK I</option>
                         <option value="CKI">Cuối HK I</option>
                         <option value="GKII">Giữa HK II</option>
                         <option value="CKII">Cuối HK II</option>
                         <option value="HÈ">Bồi dưỡng Hè</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest italic">Khối lớp</label>
                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none shadow-inner">
                       {[6,7,8,9].map(g => <option key={g} value={g}>Khối {g}</option>)}
                    </select>
                  </div>
                </div>
                
                <div 
                   onClick={() => !isUploading && fileInputRef.current?.click()}
                   className={`group p-12 border-4 border-dashed rounded-[3.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all ${
                     selectedFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 hover:border-indigo-200'
                   }`}
                >
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                   <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform ${selectedFile ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-white text-slate-300 shadow-slate-100'}`}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                   </div>
                   <div className="text-center">
                     <span className="block text-[11px] font-black text-slate-800 uppercase tracking-widest italic">
                       {selectedFile ? selectedFile.name : 'Nhấn để chọn tệp hồ sơ'}
                     </span>
                     {selectedFile && (
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-1 block italic">
                         Dung lượng thực tế: {formatFileSize(selectedFile.size)}
                       </span>
                     )}
                   </div>
                </div>

                {isUploading && (
                  <div className="space-y-4 pt-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic animate-pulse">Đang đẩy tệp trực tiếp lên Google Drive...</span>
                      <span className="text-2xl font-black text-slate-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full transition-all duration-300 relative shadow-lg"
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
                  <button onClick={() => setShowUpload(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-[11px] hover:text-slate-900 transition-colors italic">Quay lại</button>
                )}
                <button 
                  disabled={isUploading} 
                  onClick={handleUpload} 
                  className={`flex-1 py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {isUploading ? 'Đang truyền dữ liệu...' : 'Xác nhận nộp bài'}
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
