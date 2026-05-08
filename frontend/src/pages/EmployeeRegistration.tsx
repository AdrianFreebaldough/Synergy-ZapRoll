import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from '../validations/registrationSchema';
import { useRegistration } from '../hooks/useRegistration';
import Input from '../components/ui/Input';

const EmployeeRegistration: React.FC = () => {
  const { register: submitData, isLoading, error, success } = useRegistration();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { category: 'employee' }
  });

  const onSubmit = async (data: EmployeeFormData) => {
    await submitData('employee', data);
  };

  if (success) return <SuccessView />;

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Employee Entry</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">Faculty & Staff Portal</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" {...register('name')} placeholder="Enter name" error={errors.name?.message} />
        <Input label="Department" {...register('department')} placeholder="e.g. CS / Engineering" error={errors.department?.message} />
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-app-primary text-white font-bold rounded-xl shadow-lg hover:bg-app-accent transition-all duration-300 disabled:opacity-20 uppercase tracking-widest text-[11px]"
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
  </div>
);

export default EmployeeRegistration;
