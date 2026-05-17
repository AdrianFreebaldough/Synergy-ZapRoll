import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormData } from '../validations/registrationSchema';
import { useSubmission } from '../hooks/useSubmission';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingButton from '../components/ui/LoadingButton';
import { submitRegistration } from '../services/registrationService';

import SubmissionStatus from '../components/ui/SubmissionStatus';

const StudentRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const quotaId = searchParams.get('quota_id');

  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    (data: StudentFormData) => submitRegistration('student', { ...data, quotaId } as any)
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { category: 'student' }
  });

  // Helper to format Student ID (00-0000)
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // 1. Remove invalid characters (only allow digits and one hyphen)
    value = value.replace(/[^\d-]/g, '');

    // 2. Prevent multiple hyphens
    if ((value.match(/-/g) || []).length > 1) {
      value = value.replace(/-+$/, '');
    }

    // 3. Auto-format if they forget the hyphen
    if (!value.includes('-') && value.length > 2) {
      value = `${value.slice(0, 2)}-${value.slice(2, 6)}`;
    }

    // 4. Ensure hyphen is in correct position (index 2)
    if (value.includes('-') && value.indexOf('-') !== 2) {
      const digits = value.replace(/-/g, '');
      value = `${digits.slice(0, 2)}-${digits.slice(2, 6)}`;
    }

    // 5. Final length check
    value = value.slice(0, 7);

    setValue('studentId', value, { shouldValidate: true });
  };

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

  // Handle Capacity Reached professional UI
  if (error === 'Registration Capacity Reached') {
    return (
      <SubmissionStatus
        type="capacity-full"
        title="Registration Capacity Reached"
        message="The registration limit for this participant category has already been reached. We appreciate your interest in participating. Please contact the event organizer for further assistance."
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
            <Input
              label="Student ID"
              {...register('studentId', { onChange: handleStudentIdChange })}
              placeholder="00-0000"
              maxLength={7}
              error={errors.studentId?.message}
            />
            <Input label="Full Name" {...register('name')} error={errors.name?.message} />
            <Input label="Section" {...register('section')} placeholder="SBIT-3G" error={errors.section?.message} />
          </div>
        )}

        {yearLevel === '4th Year' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-500">
            <Select
              label="Participation Role"
              options={[
                { value: 'Colloquium Participant', label: 'Colloquium Participant' },
                { value: 'Colloquium Presenter', label: 'Colloquium Presenter' },
                { value: 'Poster Presenter', label: 'Poster Presenter' }
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

            {studentRole === 'Colloquium Participant' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input
                  label="Student ID"
                  {...register('studentId', { onChange: handleStudentIdChange })}
                  placeholder="00-0000"
                  maxLength={7}
                  error={errors.studentId?.message}
                />
                <Input label="Full Name" {...register('name')} error={errors.name?.message} />
                <Input label="Section" {...register('section')} placeholder="SBIT-4G" error={errors.section?.message} />
              </div>
            )}

            {(studentRole === 'Colloquium Presenter' || studentRole === 'Poster Presenter') && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input
                  label="Student ID"
                  {...register('studentId', { onChange: handleStudentIdChange })}
                  placeholder="00-0000"
                  maxLength={7}
                  error={errors.studentId?.message}
                />
                <Input
                  label={studentRole === 'Poster Presenter' ? "Full Name" : "Representative Name"}
                  {...register('representativeName')}
                  error={errors.representativeName?.message}
                />
                <Input label="Group Number" {...register('groupNumber')} error={errors.groupNumber?.message} />
                <Input label="Section" {...register('section')} placeholder="SBIT-4G" error={errors.section?.message} />
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
