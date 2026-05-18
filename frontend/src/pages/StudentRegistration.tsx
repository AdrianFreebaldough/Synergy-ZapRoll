import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormData } from '../validations/registrationSchema';
import { useSubmission } from '../hooks/useSubmission';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingButton from '../components/ui/LoadingButton';
import { submitRegistration, fetchRegistrationDetails } from '../services/registrationService';

import SubmissionStatus from '../components/ui/SubmissionStatus';

const section3rdYearOptions = Array.from({ length: 18 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return { value: `SBIT-3${letter}`, label: `SBIT-3${letter}` };
});

const section4thYearOptions = Array.from({ length: 18 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return { value: `SBIT-4${letter}`, label: `SBIT-4${letter}` };
});

const StudentRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const quotaId = searchParams.get('quota_id');
  const is3rdYearDisabled = new Date() < new Date('2026-05-19T10:00:00+08:00');

  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLookupGate, setShowLookupGate] = useState(false);
  const [lookupStudentId, setLookupStudentId] = useState('');
  const [isVerifyingLookup, setIsVerifyingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted, reset } = useSubmission(
    (data: StudentFormData & { isEdit?: boolean }) => submitRegistration('student', { ...data, quotaId } as any),
    { persistenceKey: 'student_registration' }
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

  const handleGroupNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue('groupNumber', value, { shouldValidate: true });
  };

  const yearLevel = useWatch({ control, name: 'yearLevel' });
  const studentRole = useWatch({ control, name: 'studentRole' });

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (data.firstName && data.lastName) {
        const toTitleCase = (str: string) => {
          return str.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        };

        const formattedLastName = toTitleCase(data.lastName);
        const formattedFirstName = toTitleCase(data.firstName);
        const formattedMiddleName = data.middleName ? toTitleCase(data.middleName) : '';

        data.name = `${formattedFirstName} ${formattedMiddleName ? formattedMiddleName + ' ' : ''}${formattedLastName}`;
      }
      await submitData({ ...data, isEdit: isEditMode } as any);

      // Save details to localStorage upon successful registration
      localStorage.setItem('student_registration_data', JSON.stringify(data));
      setIsEditMode(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleEditRegistrationClick = () => {
    const savedData = localStorage.getItem('student_registration_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.entries(parsed).forEach(([key, val]) => {
          setValue(key as any, val, { shouldValidate: true });
        });
        setIsEditMode(true);
        reset();
        return;
      } catch (e) {
        console.error('Failed to parse cached details:', e);
      }
    }
    setShowLookupGate(true);
    reset();
  };

  const handleVerifyLookup = async () => {
    if (lookupStudentId.length < 7) return;
    setIsVerifyingLookup(true);
    setLookupError(null);
    try {
      const response = await fetchRegistrationDetails(lookupStudentId);
      if (response.success && response.data) {
        Object.entries(response.data).forEach(([key, val]) => {
          setValue(key as any, val, { shouldValidate: true });
        });
        setIsEditMode(true);
        setShowLookupGate(false);
        localStorage.setItem('student_registration_data', JSON.stringify(response.data));
      } else {
        setLookupError('Could not retrieve your registration details. Please verify your Student ID.');
      }
    } catch (err: any) {
      console.error('Verify lookup error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Registration not found for this Student ID.';
      setLookupError(errMsg);
    } finally {
      setIsVerifyingLookup(false);
    }
  };

  if (hasAlreadySubmitted) {
    return (
      <SubmissionStatus
        type="already-submitted"
        title="Already Registered"
        message="Our system has already received your student registration. Duplicate entries are not allowed. If you need to correct any details, you can edit your submission below."
        onAction={handleEditRegistrationClick}
        actionText="Edit Registration"
      />
    );
  }

  if (success) {
    return (
      <SubmissionStatus
        type="success"
        title="Registration Submitted"
        message={
          <>
            <p>Your student registration has been recorded successfully. Thank you for participating in the event!</p>
            <div className="bg-app-success/10 border border-app-success/20 p-4 rounded-xl text-app-success flex items-start gap-3 mt-2 text-left animate-in slide-in-from-bottom-2 duration-700 delay-100 fill-mode-both">
              <Mail className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-[11px] md:text-xs">
                <p className="font-bold uppercase tracking-wide mb-1">Check Your Inbox</p>
                <p className="opacity-90 leading-relaxed">
                  A confirmation email containing your registration details and event guidelines has been dispatched to your provided address.
                  <span className="block mt-1.5 text-app-success/80 font-medium italic">
                    *Please check your Spam or Junk folder if you do not see it in your inbox shortly.
                  </span>
                </p>
              </div>
            </div>
          </>
        }
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

  if (showLookupGate) {
    return (
      <div className="max-w-[500px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass-card overflow-hidden border-t-8 border-t-app-primary shadow-2xl">
          <div className="p-6 md:p-8 border-b border-white/[0.04] bg-white/[0.01]">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
              Verify Registration
            </h1>
            <p className="mt-2 text-app-text-secondary text-xs leading-relaxed opacity-80">
              Enter your Student ID to retrieve and edit your registration details.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white/90">
                Student ID <span className="text-app-danger">*</span>
              </label>
              <input
                type="text"
                value={lookupStudentId}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 6) val = val.slice(0, 6);
                  if (val.length > 2) {
                    val = val.slice(0, 2) + '-' + val.slice(2);
                  }
                  setLookupStudentId(val);
                  setLookupError(null);
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    await handleVerifyLookup();
                  }
                }}
                className="w-full glass-input px-3.5 py-3 text-sm text-center tracking-[0.3em] font-mono"
                placeholder="00-0000"
                maxLength={7}
                autoFocus
              />
            </div>

            {lookupError && (
              <div className="p-4 bg-app-danger/10 border border-app-danger/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <p className="text-app-danger text-xs leading-relaxed text-center">
                  {lookupError}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/[0.04] flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowLookupGate(false);
                reset();
              }}
              className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl font-semibold text-sm transition-all border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerifyLookup}
              disabled={isVerifyingLookup || lookupStudentId.length < 7}
              className="flex-1 px-4 py-3 bg-app-primary hover:bg-app-accent disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-lg"
            >
              {isVerifyingLookup ? 'Verifying...' : 'Verify ID'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 transition-all duration-500">
      {isEditMode && (
        <div className="mb-6 p-4 glass-card border-l-4 border-l-app-warning bg-app-warning/10 text-app-warning animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-base leading-none">📝</span>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Registration Edit Mode</p>
              <p className="text-[10px] text-app-text-secondary mt-0.5 leading-relaxed">
                You are editing your previously submitted registration details. Submitting will update your original registration record.
              </p>
            </div>
          </div>
        </div>
      )}

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
          options={[
            {
              value: '3rd Year',
              label: `3rd Year ${is3rdYearDisabled ? '(Opens May 19, 10:00 AM)' : ''}`,
              disabled: is3rdYearDisabled
            },
            { value: '4th Year', label: '4th Year' }
          ]}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Last Name" {...register('lastName')} placeholder="Dela Cruz" error={errors.lastName?.message} />
              <Input label="First Name" {...register('firstName')} placeholder="Juan" error={errors.firstName?.message} />
              <Input label="Middle Name" {...register('middleName')} placeholder="Optional" error={errors.middleName?.message} />
            </div>
            <Select
              label="Section"
              options={section3rdYearOptions}
              {...register('section')}
              error={errors.section?.message}
            />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Last Name" {...register('lastName')} placeholder="Dela Cruz" error={errors.lastName?.message} />
                  <Input label="First Name" {...register('firstName')} placeholder="Juan" error={errors.firstName?.message} />
                  <Input label="Middle Name" {...register('middleName')} placeholder="Optional" error={errors.middleName?.message} />
                </div>
                <Select
                  label="Section"
                  options={section4thYearOptions}
                  {...register('section')}
                  error={errors.section?.message}
                />
              </div>
            )}

            {studentRole === 'Poster Presenter' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input
                  label="Student ID"
                  {...register('studentId', { onChange: handleStudentIdChange })}
                  placeholder="00-0000"
                  maxLength={7}
                  error={errors.studentId?.message}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Last Name" {...register('lastName')} placeholder="Dela Cruz" error={errors.lastName?.message} />
                  <Input label="First Name" {...register('firstName')} placeholder="Juan" error={errors.firstName?.message} />
                  <Input label="Middle Name" {...register('middleName')} placeholder="Optional" error={errors.middleName?.message} />
                </div>
                <Input
                  label="Group Number"
                  {...register('groupNumber', { onChange: handleGroupNumberChange })}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  error={errors.groupNumber?.message}
                />
                <Select
                  label="Section"
                  options={section4thYearOptions}
                  {...register('section')}
                  error={errors.section?.message}
                />
                <Input label="Capstone Title" {...register('capstoneTitle')} error={errors.capstoneTitle?.message} />
              </div>
            )}

            {studentRole === 'Colloquium Presenter' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Input
                  label="Student ID"
                  {...register('studentId', { onChange: handleStudentIdChange })}
                  placeholder="00-0000"
                  maxLength={7}
                  error={errors.studentId?.message}
                />
                <Input
                  label="Representative Name"
                  {...register('representativeName')}
                  error={errors.representativeName?.message}
                />
                <Input
                  label="Group Number"
                  {...register('groupNumber', { onChange: handleGroupNumberChange })}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  error={errors.groupNumber?.message}
                />
                <Select
                  label="Section"
                  options={section4thYearOptions}
                  {...register('section')}
                  error={errors.section?.message}
                />
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
