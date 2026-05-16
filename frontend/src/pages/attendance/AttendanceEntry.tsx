import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AttendanceForm from '../../components/attendance/AttendanceForm';

interface AttendanceEntryProps {
  subType?: string; // Passed from TokenGuard
}

const AttendanceEntry: React.FC<AttendanceEntryProps> = ({ subType }) => {
  const { token } = useParams<{ token: string }>();
  const categoryFull = subType?.toLowerCase() || '';

  const validCategories = [
    'student_am', 'student_pm', 
    'employee', 
    'guest',
    'poster_out'
  ];
  
  if (!categoryFull || !validCategories.includes(categoryFull)) {
    return <Navigate to="/invalid-link" replace />;
  }

  // Split category and session (e.g., student_am -> student, am)
  const parts = categoryFull.split('_');
  const category = parts[0];
  const session = parts[1] || null;
  const sessionLabel = session ? `(${session.toUpperCase()})` : '';

  const config = {
    student: {
      title: `Student Attendance ${sessionLabel}`,
      subtitle: 'Scan your ID or enter Student Number'
    },
    employee: {
      title: 'Employee Attendance',
      subtitle: 'Faculty & Staff Verification'
    },
    guest: {
      title: 'Guest Attendance',
      subtitle: 'Special Event Visitor Entry'
    },
    poster: {
      title: 'Poster Participant Logout',
      subtitle: 'Enter Student Number to complete your participation'
    }
  };

  const activeConfig = config[category as keyof typeof config];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AttendanceForm 
        category={category as any} 
        session={session as any}
        token={token}
        title={activeConfig.title}
        subtitle={activeConfig.subtitle}
      />
    </div>
  );
};

export default AttendanceEntry;
