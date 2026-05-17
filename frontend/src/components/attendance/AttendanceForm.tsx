import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { attendanceSchema, AttendanceSchemaType } from '../../validations/attendanceSchema';
import { useSubmission } from '../../hooks/useSubmission';
import { submitAttendance, posterLogout } from '../../services/attendanceService';
import Input from '../ui/Input';
import LoadingButton from '../ui/LoadingButton';
import SubmissionStatus from '../ui/SubmissionStatus';

interface AttendanceFormProps {
  category: 'student' | 'employee' | 'guest' | 'poster';
  session?: 'am' | 'pm' | 'out';
  token?: string;
  title: string;
  subtitle: string;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ category, session, token, title, subtitle }) => {
  const { execute: submit, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    (data: AttendanceSchemaType) => {
      if (category === 'poster') {
        return posterLogout((data as any).studentId);
      }
      return submitAttendance({ ...data, session: session as any, token });
    }
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AttendanceSchemaType>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { category } as any,
  });

  // Helper to format Student ID (00-0000)
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (category !== 'student' && category !== 'poster') return;
    let value = e.target.value;
    value = value.replace(/[^\d-]/g, '');
    if ((value.match(/-/g) || []).length > 1) {
      value = value.replace(/-+$/, '');
    }
    if (!value.includes('-') && value.length > 2) {
      value = `${value.slice(0, 2)}-${value.slice(2, 6)}`;
    }
    if (value.includes('-') && value.indexOf('-') !== 2) {
      const digits = value.replace(/-/g, '');
      value = `${digits.slice(0, 2)}-${digits.slice(2, 6)}`;
    }
    value = value.slice(0, 7);
    setValue('studentId' as any, value, { shouldValidate: true });
  };

  const onSubmit = async (data: AttendanceSchemaType) => {
    try {
      await submit(data);
    } catch (err) {
      // Handled by hook
    }
  };

  if (hasAlreadySubmitted) {
    return (
      <SubmissionStatus 
        type="already-submitted"
        title="Attendance Confirmed"
        message={`Our system has already recorded your attendance for this ${category} category.`}
      />
    );
  }

  if (success) {
    return (
      <SubmissionStatus 
        type="success"
        title="Attendance Verified"
        message={
          <>
            Your attendance has been successfully recorded. Welcome to the event! Enjoy the activities.
            <br /><br />
            <span className="text-app-success font-medium">
              We have sent a confirmation email to your account. 
              <br className="my-1" />
              Please take a screenshot of this success message. If you do not receive the email, you may use this screenshot as your official attendance verification.
            </span>
          </>
        }
      />
    );
  }

  return (
    <div className="glass-card p-6 md:p-10 transition-all duration-500 shadow-xl border-t-4 border-t-app-primary/50 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-2 uppercase tracking-widest font-medium opacity-70">{subtitle}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in slide-in-from-top-1 uppercase font-bold tracking-wider">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {category === 'student' || category === 'poster' ? (
          <Input 
            label="Student ID" 
            {...register('studentId' as any, { onChange: handleStudentIdChange })} 
            placeholder="00-0000" 
            maxLength={7}
            error={(errors as any).studentId?.message}
            disabled={isSubmitting}
          />
        ) : (
          <Input 
            label="Full Name" 
            {...register('name' as any)} 
            placeholder="John Doe" 
            error={(errors as any).name?.message}
            disabled={isSubmitting}
          />
        )}

        <div className="pt-4">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Verifying..."
            size="lg"
          >
            {category === 'poster' ? 'Confirm Logout' : 'Mark Attendance'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
