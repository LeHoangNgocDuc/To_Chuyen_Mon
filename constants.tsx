
import { User, UserRole, ScheduleItem, Document, SubstituteRequest, SystemNotification, TeachingDemo } from './types';

export const ADMIN_EMAIL = 'lehoangngocducnt@gmail.com';
export const ADMIN_PASS = 'Anphuc01';
export const ADMIN_USERNAME = 'Anphuc';

// URL Script Google Apps Script để ghi log vào Sheet
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRTznW9SHZ8yqrg9CgMJ3eUShUfPWY01JTZrJaQgAuyqiB6_vileLBgw_ZGuFvd8BN/exec';

// ID thư mục đích trên Google Drive: DATATOTOANTIN
export const DRIVE_FOLDER_ID = '1drU0oZOez7T5G0vxEqyipD4TqVInTfFk';

/**
 * HƯỚNG DẪN KHẮC PHỤC LỖI 401:
 * 1. Truy cập https://console.cloud.google.com/
 * 2. Chọn dự án -> APIs & Services -> Credentials.
 * 3. Tạo "OAuth 2.0 Client ID" loại "Web application".
 * 4. Thêm "https://to-chuyen-mon.vercel.app" (hoặc domain của bạn) vào mục "Authorized JavaScript origins".
 * 5. Copy Client ID và dán vào bên dưới.
 */
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export const MOCK_USERS: User[] = [];
export const MOCK_SCHEDULE: ScheduleItem[] = [];
export const MOCK_SUBSTITUTES: SubstituteRequest[] = [];
export const MOCK_NOTIFICATIONS: SystemNotification[] = [];
export const MOCK_DEMOS: TeachingDemo[] = [];
export const MOCK_DOCS: Document[] = [];

export const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
export const DRIVE_LINK = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=sharing`;
