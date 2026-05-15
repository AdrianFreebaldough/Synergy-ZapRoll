import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema } from '../../validations/registrationSchema';
import { useSubmission } from '../../hooks/useSubmission';
import LoadingButton from '../ui/LoadingButton';
import { submitRegistration } from '../../services/registrationService';

interface RegistrationFormProps {
  category: string;
  title: string;
}

import SubmissionStatus from '../ui/SubmissionStatus';

const RegistrationForm: React.FC<RegistrationFormProps> = ({ category, title }) => {
  const [searchParams] = useSearchParams();
  const quotaId = searchParams.get('quota_id');

  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    (data: any) => submitRegistration(category, { ...data, quotaId })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { category }
  });

  const onSubmit = async (data: any) => {
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
        message={`Our system has already received your ${category} registration. Duplicate entries are not allowed.`}
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
    <div className="glass-card p-6 md:p-8 transition-all duration-500 shadow-xl border-t-4 border-t-app-primary/50">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium opacity-70">Event Entry Details</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in slide-in-from-top-1 uppercase font-bold tracking-wider">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1 opacity-80">Full Name</label>
          <input
            {...register('fullName')}
            placeholder="John Doe"
            className="w-full px-4 py-3.5 text-sm glass-input"
            disabled={isSubmitting}
          />
          {errors.fullName && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-tighter">{(errors.fullName as any).message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1 opacity-80">Email Address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="john@example.com"
            className="w-full px-4 py-3.5 text-sm glass-input"
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-tighter">{(errors.email as any).message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1 opacity-80">Phone Number</label>
          <input
            {...register('phone')}
            placeholder="+1 234 567 890"
            className="w-full px-4 py-3.5 text-sm glass-input"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-tighter">{(errors.phone as any).message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1 opacity-80">Organization</label>
          <input
            {...register('organization')}
            placeholder="University or Company"
            className="w-full px-4 py-3.5 text-sm glass-input"
            disabled={isSubmitting}
          />
          {errors.organization && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-tighter">{(errors.organization as any).message}</p>}
        </div>

        <div className="pt-4">
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

export default RegistrationForm;
