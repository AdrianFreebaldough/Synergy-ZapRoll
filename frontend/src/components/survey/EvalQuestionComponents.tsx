import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EvalQuestion } from '../../types/survey';
import { cn } from '../../utils/cn';

interface QuestionProps {
  question: EvalQuestion;
}

// =============================================================================
// HELPER — Preserves \n newlines from the mobile app as <br/> tags on web
// =============================================================================
const PreservedText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const parts = text.split('\n');
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};

// =============================================================================
// HEADER — Display-only title/divider block
// =============================================================================
export const HeaderBlock: React.FC<QuestionProps> = ({ question }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
        <PreservedText text={question.label} />
      </h2>
      {question.description && (
        <p className="text-xs text-app-text-secondary leading-relaxed opacity-80">
          <PreservedText text={question.description} />
        </p>
      )}
    </div>
  );
};

// =============================================================================
// PRIVACY NOTICE — Checkbox consent block
// =============================================================================
export const PrivacyNotice: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-3">
      <div className="glass-card bg-white/[0.02] p-4 md:p-5 border border-white/[0.06] rounded-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <svg className="w-5 h-5 text-app-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-1">
              <PreservedText text={question.label} />
            </h3>
            {question.description && (
              <p className="text-[11px] text-app-text-secondary leading-relaxed">
                <PreservedText text={question.description} />
              </p>
            )}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 group cursor-pointer select-none py-1.5">
        <input
          type="checkbox"
          {...register(question.id, { required: question.required })}
          className="w-4 h-4 rounded border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20 shrink-0"
        />
        <span className="text-xs text-app-text-secondary group-hover:text-white transition-colors leading-snug">
          I have read and agree to the Data Privacy Notice
          {question.required && <span className="text-app-danger ml-1">*</span>}
        </span>
      </label>

      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold tracking-wide">
          You must accept the privacy notice to continue
        </p>
      )}
    </div>
  );
};

// =============================================================================
// STAR RATING — 1-5 star interactive rating
// =============================================================================
export const StarRating: React.FC<QuestionProps> = ({ question }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const currentValue = watch(question.id);

  React.useEffect(() => {
    register(question.id, { required: question.required });
  }, [register, question.id, question.required]);

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">
          <PreservedText text={question.description} />
        </p>
      )}

      <div className="flex items-center gap-1.5">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(question.id, star, { shouldValidate: true })}
            className="group p-1 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={`Rate ${star} out of 5`}
          >
            <svg
              className={cn(
                'w-8 h-8 md:w-9 md:h-9 transition-all duration-300',
                currentValue >= star
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                  : 'text-white/10 fill-transparent group-hover:text-amber-400/40'
              )}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
        {currentValue && (
          <span className="ml-3 text-xs text-app-text-muted font-medium tabular-nums">
            {currentValue}/5
          </span>
        )}
      </div>

      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold tracking-wide">
          Please provide a rating
        </p>
      )}
    </div>
  );
};

// =============================================================================
// LIKERT TABLE — Driven by statements[] array from mobile app
// =============================================================================
const LIKERT_SCALES: Record<string, string[]> = {
  agreement: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  quality: ['Needs Improvement', 'Fair', 'Good', 'Very Good', 'Excellent'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  satisfaction: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
};

export const EvalLikertTable: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  const statements = question.statements || [];
  
  // Use options from JSON if available, otherwise fallback to lookup
  const category = question.likertScaleType?.toLowerCase() || 'agreement';
  const scaleLabels = (question.options && question.options.length > 0) 
    ? question.options 
    : (LIKERT_SCALES[category] || LIKERT_SCALES.agreement);
    
  const scaleValues = [1, 2, 3, 4, 5];

  if (statements.length === 0) {
    return (
      <div className="p-4 border border-dashed border-white/10 rounded-xl text-[10px] text-app-text-muted uppercase tracking-widest text-center">
        No statements configured for this Likert question
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight mb-1">
          <PreservedText text={question.description} />
        </p>
      )}

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="min-w-[520px]">
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="p-2.5 text-[10px] uppercase tracking-widest text-app-text-muted font-bold w-[35%]">
                  Statement
                </th>
                {scaleLabels.map((label, i) => (
                  <th key={i} className="p-2 text-center text-[9px] uppercase tracking-wider text-app-text-muted font-bold leading-tight">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statements.map((statement, sIdx) => {
                const fieldName = `${question.id}_s${sIdx}`;
                return (
                  <tr key={sIdx} className="glass-card bg-white/[0.02]">
                    <td className="p-3 text-xs text-app-text-secondary font-medium leading-snug">
                      <PreservedText text={statement} />
                    </td>
                    {scaleValues.map((value) => (
                      <td key={value} className="p-3 text-center">
                        <input
                          type="radio"
                          value={value}
                          {...register(fieldName, { required: question.required })}
                          className="w-3.5 h-3.5 border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {statements.some((_, sIdx) => errors[`${question.id}_s${sIdx}`]) && (
        <p className="text-app-danger text-[10px] uppercase font-bold tracking-wide">
          Please answer all statements
        </p>
      )}
    </div>
  );
};

// =============================================================================
// SHORT TEXT — Single line input
// =============================================================================
export const EvalShortText: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  const isEmail = question.subtype === 'email' || question.label.toLowerCase().includes('email');

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">
          <PreservedText text={question.description} />
        </p>
      )}
      <input
        {...register(question.id, {
          required: question.required ? 'This field is required' : false,
          pattern: isEmail ? {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address'
          } : undefined
        })}
        type={question.subtype || 'text'}
        className="w-full glass-input px-3.5 py-2.5 text-sm"
        placeholder={isEmail ? 'you@example.com' : 'Your answer'}
      />
      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold">
          {(errors[question.id] as any).message || 'This field is required'}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// PARAGRAPH — Multi-line textarea
// =============================================================================
export const EvalParagraph: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">
          <PreservedText text={question.description} />
        </p>
      )}
      <textarea
        {...register(question.id, { required: question.required })}
        className="w-full glass-input px-3.5 py-2.5 text-sm min-h-[100px] resize-none"
        placeholder="Your answer"
      />
      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold">This field is required</p>
      )}
    </div>
  );
};

// =============================================================================
// RADIO GROUP — Single-select from options[]
// =============================================================================
export const EvalRadioGroup: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">
          <PreservedText text={question.description} />
        </p>
      )}
      <div className="space-y-1.5">
        {question.options?.map((option, i) => (
          <label key={i} className="flex items-center gap-2.5 group cursor-pointer py-0.5">
            <input
              type="radio"
              value={option}
              {...register(question.id, { required: question.required })}
              className="w-3.5 h-3.5 rounded-full border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20"
            />
            <span className="text-sm text-app-text-secondary group-hover:text-white transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold">Please select an option</p>
      )}
    </div>
  );
};

// =============================================================================
// CHECKBOX GROUP — Multi-select from options[]
// =============================================================================
export const EvalCheckboxGroup: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">
          <PreservedText text={question.description} />
        </p>
      )}
      <div className="space-y-1.5">
        {question.options?.map((option, i) => (
          <label key={i} className="flex items-center gap-2.5 group cursor-pointer py-0.5">
            <input
              type="checkbox"
              value={option}
              {...register(question.id, { required: question.required })}
              className="w-3.5 h-3.5 rounded border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20"
            />
            <span className="text-sm text-app-text-secondary group-hover:text-white transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold">Please select at least one</p>
      )}
    </div>
  );
};

// =============================================================================
// DROPDOWN — Select from options[]
// =============================================================================
export const EvalDropdown: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        <PreservedText text={question.label} />
        {question.required && <span className="text-app-danger ml-1">*</span>}
      </label>
      <select
        {...register(question.id, { required: question.required })}
        className="w-full glass-input px-3.5 py-2.5 text-sm"
      >
        <option value="">Select an option</option>
        {question.options?.map((option, i) => (
          <option key={i} value={option} className="bg-app-surface">
            {option}
          </option>
        ))}
      </select>
      {errors[question.id] && (
        <p className="text-app-danger text-[10px] uppercase font-bold">This field is required</p>
      )}
    </div>
  );
};
