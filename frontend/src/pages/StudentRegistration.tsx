import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormData } from '../validations/registrationSchema';
import { useRegistration } from '../hooks/useRegistration';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const StudentRegistration: React.FC = () => {
  const { register: submitData, isLoading, error, success } = useRegistration();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { category: 'student' }
  });

  const yearLevel = useWatch({ control, name: 'yearLevel' });
  const studentRole = useWatch({ control, name: 'studentRole' });

  const onSubmit = async (data: StudentFormData) => {
    await submitData('student', data);
  };

  if (success) return <SuccessView />;

  return (
    <div className="glass-card p-6 md:p-8 transition-all duration-500">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Student Entry</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">Registration Details</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select 
          label="Year Level" 
          options={[{ value: '3rd Year', label: '3rd Year' }, { value: '4th Year', label: '4th Year' }]} 
          {...register('yearLevel')} 
          error={errors.yearLevel?.message} 
        />

        {yearLevel === '3rd Year' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
            <Input label="Student ID" {...register('studentId')} placeholder="00-0000" error={errors.studentId?.message} />
            <Input label="Full Name" {...register('name')} error={errors.name?.message} />
            <Input label="Section" {...register('section')} error={errors.section?.message} />
          </div>
        )}

        {yearLevel === '4th Year' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-500">
            <Select 
              label="Participation Role" 
              options={[
                { value: 'Participant', label: 'Participant' },
                { value: 'Presenter', label: 'Presenter' },
                { value: 'Poster', label: 'Poster' }
              ]} 
              {...register('studentRole')} 
              error={errors.studentRole?.message} 
            />

            {studentRole === 'Participant' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input label="Student ID" {...register('studentId')} placeholder="00-0000" error={errors.studentId?.message} />
                <Input label="Full Name" {...register('name')} error={errors.name?.message} />
                <Input label="Section" {...register('section')} error={errors.section?.message} />
              </div>
            )}

            {(studentRole === 'Presenter' || studentRole === 'Poster') && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input label="Representative Name" {...register('representativeName')} error={errors.representativeName?.message} />
                <Input label="Group Number" {...register('groupNumber')} error={errors.groupNumber?.message} />
                <Input label="Section" {...register('section')} error={errors.section?.message} />
                <Input label="Capstone Title" {...register('capstoneTitle')} error={errors.capstoneTitle?.message} />
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !yearLevel}
            className="w-full py-3.5 bg-app-primary text-white font-bold rounded-xl shadow-lg hover:bg-app-accent active:scale-[0.98] transition-all duration-300 disabled:opacity-20 uppercase tracking-widest text-[11px]"
          >
            {isLoading ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SuccessView = () => (
  <div className="glass-card p-10 text-center animate-in zoom-in duration-500">
    <div className="w-16 h-16 bg-app-success/10 text-app-success rounded-full flex items-center justify-center mx-auto mb-4 border border-app-success/20">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 className="text-xl font-bold text-app-text-primary mb-1">Registration Saved</h2>
    <p className="text-app-text-muted text-[10px] uppercase tracking-widest">Entry recorded in system</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-6 text-app-primary text-[10px] font-bold uppercase tracking-widest hover:text-app-accent transition-colors"
    >
      New Submission
    </button>
  </div>
);

export default StudentRegistration;
