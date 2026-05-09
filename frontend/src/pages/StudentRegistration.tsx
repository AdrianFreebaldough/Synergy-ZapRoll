import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormData } from '../validations/registrationSchema';
import { useSubmission } from '../hooks/useSubmission';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingButton from '../components/ui/LoadingButton';
import { submitRegistration } from '../services/registrationService';

import SubmissionStatus from '../components/ui/SubmissionStatus';

const StudentRegistration: React.FC = () => {
  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    (data: StudentFormData) => submitRegistration('student', data)
  );
  
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
    try {
      await submitData(data);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (hasAlreadySubmitted) {
    return (
      <SubmissionStatus 
        type="already-submitted"
        title="Already Registered"
        message="Our system has already received your student registration. Duplicate entries are not allowed."
      />
    );
  }

  if (success) {
    return (
      <SubmissionStatus 
        type="success"
        title="Registration Submitted"
        message="Your student registration has been recorded successfully. Thank you for participating in the event!"
      />
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 transition-all duration-500">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Student Entry</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">Registration Details</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in slide-in-from-top-1">
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
            <Input 
              label="Email Address" 
              type="email"
              placeholder="your.name@example.com"
              {...register('email')} 
              error={errors.email?.message} 
            />
            <Input label="Student ID" {...register('studentId')} placeholder="00-0000" error={errors.studentId?.message} />
            <Input label="Full Name" {...register('name')} error={errors.name?.message} />
            <Input label="Section" {...register('section')} placeholder="SBIT-3G" error={errors.section?.message} />
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

            {studentRole && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <Input 
                  label="Email Address" 
                  type="email"
                  placeholder="your.name@example.com"
                  {...register('email')} 
                  error={errors.email?.message} 
                  className="mb-4"
                />
              </div>
            )}

            {studentRole === 'Participant' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input label="Student ID" {...register('studentId')} placeholder="00-0000" error={errors.studentId?.message} />
                <Input label="Full Name" {...register('name')} error={errors.name?.message} />
                <Input label="Section" {...register('section')} placeholder="SBIT-3G" error={errors.section?.message} />
              </div>
            )}

            {(studentRole === 'Presenter' || studentRole === 'Poster') && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input label="Representative Name" {...register('representativeName')} error={errors.representativeName?.message} />
                <Input label="Group Number" {...register('groupNumber')} error={errors.groupNumber?.message} />
                <Input label="Section" {...register('section')} placeholder="SBIT-3G" error={errors.section?.message} />
                <Input label="Capstone Title" {...register('capstoneTitle')} error={errors.capstoneTitle?.message} />
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            disabled={!yearLevel}
            loadingText="Saving Registration..."
            size="lg"
          >
            Complete Registration
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;
