import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { guestSchema, GuestFormData } from '../validations/registrationSchema';
import { useSubmission } from '../hooks/useSubmission';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingButton from '../components/ui/LoadingButton';
import { submitRegistration } from '../services/registrationService';
import SubmissionStatus from '../components/ui/SubmissionStatus';

const GuestWalkIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const quotaId = searchParams.get('quota_id');

  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    (data: GuestFormData) => submitRegistration('guest', { ...data, quotaId, isWalkIn: true } as any)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { category: 'guest' }
  });

  const onSubmit = async (data: GuestFormData) => {
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
        message="Our system has already received your guest registration. Enjoy the event!"
      />
    );
  }

  if (success) {
    return (
      <SubmissionStatus
        type="success"
        title="Walk-In Successful!"
        message="Your guest registration is complete. You may now enter the event. Have a great day!"
      />
    );
  }

  if (error === 'Registration Capacity Reached') {
    return (
      <SubmissionStatus
        type="capacity-full"
        title="Registration Capacity Reached"
        message="The registration limit for guest walk-ins has already been reached. Please contact the event organizer."
      />
    );
  }

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Guest Walk-In</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">On-site Guest Check-in</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Guest Type"
          options={[{ value: 'Speaker', label: 'Speaker' }, { value: 'Others', label: 'Others' }]}
          {...register('guestType')}
          error={errors.guestType?.message}
        />
        <Input label="Full Name" {...register('name')} placeholder="Enter name" error={errors.name?.message} />

        <div className="pt-2">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Processing Walk-In..."
            size="lg"
          >
            Submit & Enter Event
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default GuestWalkIn;
