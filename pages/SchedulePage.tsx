
import React from 'react';
import { User, UserRole } from '../types';
import { MOCK_SCHEDULE } from '../constants';

interface SchedulePageProps {
  user: User;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ user }) => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const periods = [1, 2, 3, 4, 5];

  const getScheduleFor = (day: number, period: number) => {
    return MOCK_SCHEDULE.find(s => s.dayOfWeek === day + 1 && s.period === period);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thời khóa biểu</h1>
          <p className="text-slate-500">Lịch dạy chính khóa và bồi dưỡng tuần 8</p>
        </div>
        <div className="flex gap-2">
          {user.role === UserRole.TCM && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Điều chỉnh lịch
            </button>
          )}
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            In lịch dạy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Tiết</th>
                {days.map(day => (
                  <th key={day} className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[120px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periods.map(period => (
                <tr key={period} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">Tiết {period}</span>
                      <span className="text-[10px] text-slate-400">07:30 - 08:15</span>
                    </div>
                  </td>
                  {days.map((day, dayIdx) => {
                    const item = getScheduleFor(dayIdx + 1, period);
                    return (
                      <td key={dayIdx} className="p-2">
                        {item ? (
                          <div className={`p-3 rounded-lg border text-sm ${
                            item.isSubstitute 
                              ? 'bg-amber-50 border-amber-200 text-amber-800' 
                              : 'bg-blue-50 border-blue-200 text-blue-800'
                          }`}>
                            <div className="font-bold">{item.className}</div>
                            <div className="text-xs opacity-80">{item.subject}</div>
                            {item.isSubstitute && <div className="text-[10px] mt-1 italic font-medium">Dạy thay</div>}
                          </div>
                        ) : (
                          <div className="h-16 border border-dashed border-slate-100 rounded-lg"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div className="text-sm font-semibold text-amber-800">Ghi chú tuần này</div>
          <p className="text-sm text-amber-700">Ngày Thứ Năm (27/10) có lịch họp Tổ chuyên môn vào tiết 5 tại phòng 202. Đề nghị các giáo viên có mặt đầy đủ.</p>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
