import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from '../validations/registrationSchema';
import { useSubmission } from '../hooks/useSubmission';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingButton from '../components/ui/LoadingButton';
import { submitRegistration } from '../services/registrationService';

import SubmissionStatus from '../components/ui/SubmissionStatus';

const DEPARTMENTS = [
  'College of Education',
  'College of Computer Studies',
  'College of Engineering',
  'College of Accountancy',
  'College of Entrepreneurship',
  'Administrative Department',
  'Security Services Department',
  'Excellence department'
];

const EmployeeRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const quotaId = searchParams.get('quota_id');

  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    (data: EmployeeFormData) => submitRegistration('employee', { ...data, quotaId } as any)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { category: 'employee' }
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await submitData(data);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (hasAlreadySubmitted) {
    return (
      <SubmissionStatus
        type="already-submitted"
        title="Already Registered"
        message="Our system has already received your employee registration. Thank you for your service!"
      />
    );
  }

  if (success) {
    return (
      <SubmissionStatus
        type="success"
        title="Registration Confirmed"
        message="Your faculty/staff registration has been successfully recorded. No further action is required."
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
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Employee Entry</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">Faculty & Staff Portal</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" {...register('name')} placeholder="Enter name" error={errors.name?.message} />
        <Select
          label="Department"
          {...register('department')}
          options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
          error={errors.department?.message}
        />

        <div className="pt-2">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Processing Registration..."
            size="lg"
          >
            Complete Registration
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;
