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
import { submitRegistration } from '../services/registrationService';

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
  const [isEditingOriginal, setIsEditingOriginal] = useState(false);
  const [submittedAsEdit, setSubmittedAsEdit] = useState(false);

  // Scan browser localStorage to check if returning Poster Presenter for dual role
  const savedData = localStorage.getItem('student_registration_data');
  let isReturningPosterPresenter = false;
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      const roles = parsed.studentRole || parsed.role || '';
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      
      const hasPoster = rolesArray.includes('Poster Presenter');
      const hasColloquium = rolesArray.includes('Colloquium Presenter') || rolesArray.includes('Colloquium Participant');
      
      if (hasPoster && !hasColloquium) {
        isReturningPosterPresenter = true;
      }
    } catch (e) {
      console.error('Failed to parse cached details:', e);
    }
  }
  const isDualRoleMode = isReturningPosterPresenter && !isEditingOriginal;

  const { execute: submitData, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
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
    defaultValues: { category: 'student', isEdit: false }
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
      // Track whether this submission is an actual dual role edit addition (isEditMode is true, but NOT editing original registration)
      const isDualRoleAddition = isEditMode && !isEditingOriginal;
      setSubmittedAsEdit(isDualRoleAddition);

      const response = await submitData({ ...data, isEdit: isEditMode } as any);

      // Save details to localStorage upon successful registration
      // We synchronize directly with the backend's saved record to guarantee perfect data parity!
      if (response && response.data) {
        const reg = response.data;
        const meta = reg.metadata || {};
        
        const nameParts = (reg.full_name || '').split(' ');
        const firstName = meta.firstName || nameParts[0] || '';
        const lastName = meta.lastName || nameParts[nameParts.length - 1] || '';
        const middleName = meta.middleName || (nameParts.length > 2 ? nameParts.slice(1, nameParts.length - 1).join(' ') : '');

        const savedPayload = {
          firstName,
          lastName,
          middleName,
          email: reg.email || '',
          studentId: reg.external_id || '',
          yearLevel: meta.yearLevel || data.yearLevel || '',
          studentRole: meta.studentRole || [data.studentRole].filter(Boolean),
          section: meta.section || data.section || '',
          groupNumber: meta.groupNumber || data.groupNumber || '',
          representativeName: meta.representativeName || data.representativeName || '',
          capstoneTitle: meta.capstoneTitle || data.capstoneTitle || ''
        };

        localStorage.setItem('student_registration_data', JSON.stringify(savedPayload));
      } else {
        let finalSavedRoles: string[] = [];
        if (isDualRoleAddition) {
          finalSavedRoles = ["Poster Presenter", data.studentRole || ""].filter(Boolean);
        } else {
          const currentRole = data.studentRole || "";
          const roleArray = Array.isArray(currentRole) ? currentRole : [currentRole];
          finalSavedRoles = roleArray.filter(Boolean);
        }

        const savedPayload = {
          ...data,
          studentRole: finalSavedRoles
        };
        localStorage.setItem('student_registration_data', JSON.stringify(savedPayload));
      }

      setIsEditingOriginal(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const onInvalid = (errors: any) => {
    console.error('❌ React Hook Form Validation Errors:', errors);
  };

  const handleEditRegistrationClick = () => {
    const savedData = localStorage.getItem('student_registration_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.entries(parsed).forEach(([key, val]) => {
          if (key === 'studentRole') {
            const rolesArray = Array.isArray(val) ? val : [val];
            setValue('studentRole' as any, rolesArray[rolesArray.length - 1], { shouldValidate: true });
          } else {
            setValue(key as any, val, { shouldValidate: true });
          }
        });
      } catch (e) {
        console.error('Failed to parse cached details:', e);
      }
    }
    setIsEditMode(true);
    setIsEditingOriginal(true);
    setValue('isEdit', true, { shouldValidate: true });
  };

  // Enforce duplicate check and provide options for Poster Presenters
  if (hasAlreadySubmitted && !isEditMode) {
    if (isReturningPosterPresenter) {
      return (
        <SubmissionStatus
          type="already-submitted"
          title="Already Registered"
          message={
            <div className="space-y-6">
              <p className="leading-relaxed text-sm">
                Our system has already received your student registration as a Poster Presenter. You are eligible to register for a second role (Colloquium Presenter or Colloquium Participant) to complete your dual-role status.
              </p>
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => {
                    const savedData = localStorage.getItem('student_registration_data');
                    if (savedData) {
                      try {
                        const parsed = JSON.parse(savedData);
                        Object.entries(parsed).forEach(([key, val]) => {
                          if (key !== 'studentRole') {
                            setValue(key as any, val, { shouldValidate: true });
                          }
                        });
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    setIsEditMode(true);
                    setIsEditingOriginal(false);
                    setValue('isEdit', true, { shouldValidate: true });
                    setValue('studentRole', 'Colloquium Participant', { shouldValidate: true });
                  }}
                  className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-app-primary hover:text-app-accent transition-all hover:scale-105 active:scale-95 py-2 px-4"
                >
                  Register for Second Role
                </button>
                <button
                  type="button"
                  onClick={handleEditRegistrationClick}
                  className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-app-text-secondary hover:text-white transition-all hover:scale-105 active:scale-95 py-2 px-4"
                >
                  Edit Existing Details
                </button>
              </div>
            </div>
          }
        />
      );
    }

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
        title={submittedAsEdit ? "Registration Updated" : "Registration Submitted"}
        message={
          <>
            <p>
              {submittedAsEdit 
                ? "Your dual-role student registration details have been updated successfully!" 
                : "Your student registration has been recorded successfully. Thank you for participating in the event!"}
            </p>
            {submittedAsEdit ? (
              <div className="bg-app-warning/10 border border-app-warning/20 p-4 rounded-xl text-app-warning flex items-start gap-3 mt-2 text-left animate-in slide-in-from-bottom-2 duration-700 delay-100 fill-mode-both">
                <span className="text-xl shrink-0 mt-0.5">📸</span>
                <div className="text-[11px] md:text-xs">
                  <p className="font-bold uppercase tracking-wide mb-1">Capture Your Proof</p>
                  <p className="opacity-90 leading-relaxed">
                    Please take a <strong>screenshot</strong> of this confirmation screen as proof of your second role registration. 
                    <span className="block mt-1.5 text-app-warning/80 font-medium italic">
                      *Note: A second confirmation email will not be dispatched for dual-role updates.
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-app-success/10 border border-app-success/20 p-4 rounded-xl text-app-success flex items-start gap-3 mt-2 text-left animate-in slide-in-from-bottom-2 duration-700 delay-100 fill-mode-both">
                <Mail className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-[11px] md:text-xs space-y-3">
                  <div>
                    <p className="font-bold uppercase tracking-wide mb-1">Check Your Inbox</p>
                    <p className="opacity-90 leading-relaxed">
                      A confirmation email containing your registration details and event guidelines has been dispatched to your provided address.
                      <span className="block mt-1 text-app-success/80 font-medium italic">
                        *Please check your Spam or Junk folder if you do not see it in your inbox shortly.
                      </span>
                    </p>
                  </div>
                  {yearLevel === '3rd Year' && (
                    <div className="pt-2.5 border-t border-app-success/20 space-y-1.5">
                      <div>
                        <p className="font-bold uppercase tracking-wide mb-0.5 text-white text-[10px]">Poster Presentation Schedule</p>
                        <p className="opacity-90 leading-relaxed text-app-text-secondary">
                          The Poster Presentations and Exhibition are scheduled to commence at <strong className="text-white">11:00 AM</strong>. Please plan your arrival accordingly.
                        </p>
                      </div>
                      <div className="pt-0.5">
                        <p className="opacity-90 leading-relaxed text-app-text-secondary">
                          Please note that you are only required to <strong className="text-white font-semibold">log your attendance once</strong> during the exhibition session to be eligible for your certificate.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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

  return (
    <div className="glass-card p-6 md:p-8 transition-all duration-500">
      {isEditingOriginal && (
        <div className="mb-6 p-4 glass-card border-l-4 border-l-app-warning bg-app-warning/10 text-app-warning animate-in slide-in-from-top-2 duration-300">
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">Registration Edit Mode</p>
            <p className="text-[10px] text-app-text-secondary mt-0.5 leading-relaxed">
              You are editing your previously submitted registration details. Submitting will update your original registration record.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Student Entry</h2>
        <p className="text-app-text-secondary text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">Registration Details</p>
      </div>

      {isDualRoleMode && (
        <div className="mb-6 p-4 glass-card border-l-4 border-l-app-primary bg-app-primary/10 text-app-primary animate-in slide-in-from-top-2 duration-300">
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">Add Your Second Role</p>
            <p className="text-[10px] text-app-text-secondary mt-0.5 leading-relaxed">
              We've securely loaded your registration details from your first attempt (Poster Presenter). Please select your second role below to complete your dual registration!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-[10px] animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-xs space-y-2 animate-in fade-in slide-in-from-top-1">
          <p className="font-bold uppercase tracking-wider text-[10px] text-app-danger">Form Validation Failures:</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-app-text-secondary">
            {Object.entries(errors).map(([field, err]: [string, any]) => (
              <li key={field}>
                <span className="font-semibold text-white capitalize">{field}</span>: {err?.message || 'Invalid value'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isDualRoleMode ? (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 animate-in fade-in duration-500">

          <div className="space-y-4">
            <Select
              label="Participation Role"
              options={[
                { value: 'Colloquium Participant', label: 'Colloquium Participant' },
                { 
                  value: 'Colloquium Presenter', 
                  label: 'Colloquium Presenter',
                  disabled: true
                },
                { 
                  value: 'Poster Presenter', 
                  label: 'Poster Presenter',
                  disabled: true
                }
              ]}
              {...register('studentRole')}
              error={errors.studentRole?.message}
            />
            
            {studentRole === 'Colloquium Presenter' && (
              <div className="space-y-4 mt-4 animate-in fade-in zoom-in-95 duration-500">
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

          <div className="pt-2">
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              disabled={!studentRole}
              loadingText="Saving Registration..."
              size="lg"
            >
              Complete Registration
            </LoadingButton>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <Select
            label="Year Level"
            options={[
              {
                value: '3rd Year',
                label: `3rd Year ${is3rdYearDisabled ? '(Opens May 19, 10:00 AM)' : ''}`,
                disabled: is3rdYearDisabled || (isEditingOriginal && yearLevel !== '3rd Year')
              },
              { 
                value: '4th Year', 
                label: '4th Year',
                disabled: isEditingOriginal && yearLevel !== '4th Year'
              }
            ]}
            {...register('yearLevel')}
            error={errors.yearLevel?.message}
          />
          {isEditingOriginal && (
            <p className="text-[10px] text-app-warning/80 mt-1 italic animate-in fade-in slide-in-from-top-1">
              *Year level is locked and cannot be modified when editing existing registration details.
            </p>
          )}

          {yearLevel === '3rd Year' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="bg-app-warning/10 border border-app-warning/20 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="text-[11px] md:text-xs text-left">
                  <p className="font-bold uppercase tracking-wider mb-0.5 text-white text-[10px]">Poster Attendee Registration Only</p>
                  <p className="opacity-90 leading-relaxed text-app-text-secondary text-[11px]">
                    You are registering exclusively as a <strong className="text-white font-semibold">Poster Attendee</strong>. Please note that access is restricted to the poster exhibition area, and entry into the main auditorium is not permitted due to capacity limitations.
                  </p>
                </div>
              </div>
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
                  { 
                    value: 'Poster Presenter', 
                    label: 'Poster Presenter',
                    disabled: isReturningPosterPresenter && !isEditingOriginal
                  }
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
      )}
    </div>
  );
};

export default StudentRegistration;
