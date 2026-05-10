export type AttendanceCategory = 'student' | 'employee' | 'guest';

export interface AttendanceBase {
  category: AttendanceCategory;
  session?: 'am' | 'pm';
  token?: string;
  timestamp?: string;
}

export interface StudentAttendance extends AttendanceBase {
  category: 'student';
  studentId: string;
}

export interface EmployeeAttendance extends AttendanceBase {
  category: 'employee';
  name: string;
}

export interface GuestAttendance extends AttendanceBase {
  category: 'guest';
  name: string;
}

export type AttendanceFormData = StudentAttendance | EmployeeAttendance | GuestAttendance;
