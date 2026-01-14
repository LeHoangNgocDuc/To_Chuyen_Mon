
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
  assignedClasses: string[];
  gradeLevel?: number[]; 
  isChuNhiem?: boolean;
  duties: string[];
}

export interface TeachingDemo {
  id: string;
  week: number;
  date: string;
  period: number;
  className: string;
  teacherId: string;
  tct: number; // Tiết chương trình
  lessonName: string;
  reporterId: string; // Giáo viên viết phiếu
  note: string;
  session: 'Morning' | 'Afternoon';
}

export interface SystemNotification {
  id: string;
  senderId: string;
  senderName: string;
  role: string;
  content: string;
  date: string;
  executionTime?: string;
  sendEmailReminder: boolean;
  isImportant: boolean;
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
  substituteTeacherId: string;
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
