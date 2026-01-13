
export enum UserRole {
  GV = 'Giáo viên',
  NV = 'Nhân viên',
  TCM = 'Tổ trưởng chuyên môn',
  TP = 'Tổ phó',
  BGH = 'Ban giám hiệu'
}

export enum StaffPosition {
  NONE = 'Không',
  THIET_BI = 'Nhân viên Thiết bị',
  THU_VIEN = 'Nhân viên Thư viện'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  subject: string;
  staffPosition?: StaffPosition;
  isApproved: boolean;
  assignedClasses: string[]; // Lưu dạng ["6/1", "7/2"]
  gradeLevel?: number[]; 
  isChuNhiem?: boolean;
  duties: string[]; // Danh sách chức vụ kiêm nhiệm
}

export interface TeacherScoreRow {
  teacherId: string;
  tt: number; dn: number; sh: number; nq: number; qt: number;
  ga: number; sd: number; dg: number; lbg: number; tb: number; dt_hsss: number;
  ngc: number; bc: number; dt_ngaycong: number;
  tg: number; thct: number; clbm: number; dt_ctcm: number;
  chuNhiem: number;
  kiemNhiem: number;
  congTacKhac: number;
}

export interface ScheduleItem {
  id: string;
  teacherId: string;
  subject: string;
  className: string;
  period: number;
  dayOfWeek: number;
  session: 'Morning' | 'Afternoon';
  note?: string;
  isSubstitute?: boolean;
}

export interface SubstituteRequest {
  id: string;
  absentTeacherId: string;
  absentTeacherName?: string;
  substituteTeacherId: string;
  substituteTeacherName?: string;
  reason: string;
  date: string;
  period: number;
  className: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  pointsAwarded: number;
}

export enum DocStatus {
  Approved = 'Đã duyệt',
  Draft = 'Chờ duyệt',
  NeedsEdit = 'Cần chỉnh sửa'
}

// Added DocType to resolve "Module '"./types"' has no exported member 'DocType'"
export type DocType = string;

export interface Document {
  id: string;
  title: string;
  category: 'Đề cương' | 'Đề thi';
  type: DocType;
  grade: number;
  authorId: string;
  status: DocStatus;
  uploadDate: string;
  fileUrl?: string;
}

export interface SystemNotification {
  id: string;
  role: string;
  date: string;
  sender: string;
  content: string;
  isImportant?: boolean;
}

// Added TeachingDemo to resolve "Module '"./types"' has no exported member 'TeachingDemo'"
export interface TeachingDemo {
  id: string;
  teacherId: string;
  topic: string;
  date: string;
  className: string;
  rating: string;
}
