import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema } from '../../validations/registrationSchema';
import { useRegistration } from '../../hooks/useRegistration';

interface RegistrationFormProps {
  category: string;
  title: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ category, title }) => {
  const { register: submitData, isLoading, error, success } = useRegistration();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { category }
  });

  const onSubmit = async (data: any) => {
    await submitData(category, data);
  };

  if (success) {
    return (
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
  }

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">Event Entry Details</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
          <input
            {...register('fullName')}
            placeholder="John Doe"
            className="w-full px-4 py-3 text-sm glass-input"
          />
          {errors.fullName && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase">{(errors.fullName as any).message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="john@example.com"
            className="w-full px-4 py-3 text-sm glass-input"
          />
          {errors.email && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase">{(errors.email as any).message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
          <input
            {...register('phone')}
            placeholder="+1 234 567 890"
            className="w-full px-4 py-3 text-sm glass-input"
          />
          {errors.phone && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase">{(errors.phone as any).message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1">Organization</label>
          <input
            {...register('organization')}
            placeholder="University or Company"
            className="w-full px-4 py-3 text-sm glass-input"
          />
          {errors.organization && <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase">{(errors.organization as any).message}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-app-primary text-white font-bold rounded-xl hover:bg-app-accent transition-all duration-300 disabled:opacity-20 uppercase tracking-widest text-[11px]"
          >
            {isLoading ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
