import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AttendanceForm from '../../components/attendance/AttendanceForm';

interface AttendanceEntryProps {
  subType?: string; // Passed from TokenGuard
}

const AttendanceEntry: React.FC<AttendanceEntryProps> = ({ subType }) => {
  const category = subType?.toLowerCase() || '';

  const validCategories = ['student', 'employee', 'guest'];
  
  if (!category || !validCategories.includes(category)) {
    return <Navigate to="/invalid-link" replace />;
  }

  const config = {
    student: {
      title: 'Student Attendance',
      subtitle: 'Scan your ID or enter Student Number'
    },
    employee: {
      title: 'Employee Attendance',
      subtitle: 'Faculty & Staff Verification'
    },
    guest: {
      title: 'Guest Attendance',
      subtitle: 'Special Event Visitor Entry'
    }
  };

  const activeConfig = config[category as keyof typeof config];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AttendanceForm 
        category={category as any} 
        title={activeConfig.title}
        subtitle={activeConfig.subtitle}
      />
    </div>
  );
};

export default AttendanceEntry;
