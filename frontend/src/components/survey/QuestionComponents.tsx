import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SurveyQuestion } from '../../types/survey';
import { cn } from '../../utils/cn';

interface QuestionProps {
  question: SurveyQuestion;
}

export const ShortText: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        {question.title} {question.is_required && <span className="text-app-danger">*</span>}
      </label>
      {question.description && <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">{question.description}</p>}
      <input
        {...register(question.id, { required: question.is_required })}
        className="w-full glass-input px-3.5 py-2 text-sm"
        placeholder="Your answer"
      />
      {errors[question.id] && <p className="text-app-danger text-[10px] uppercase font-bold">This field is required</p>}
    </div>
  );
};

export const Paragraph: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        {question.title} {question.is_required && <span className="text-app-danger">*</span>}
      </label>
      {question.description && <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">{question.description}</p>}
      <textarea
        {...register(question.id, { required: question.is_required })}
        className="w-full glass-input px-3.5 py-2 text-sm min-h-[80px] resize-none"
        placeholder="Your answer"
      />
      {errors[question.id] && <p className="text-app-danger text-[10px] uppercase font-bold">This field is required</p>}
    </div>
  );
};

export const RadioGroup: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-white/90">
        {question.title} {question.is_required && <span className="text-app-danger">*</span>}
      </label>
      {question.description && <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">{question.description}</p>}
      <div className="space-y-1.5">
        {question.options?.map((option: any) => (
          <label key={option.id} className="flex items-center gap-2.5 group cursor-pointer">
            <input
              type="radio"
              value={option.value}
              {...register(question.id, { required: question.is_required })}
              className="w-3.5 h-3.5 rounded-full border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20"
            />
            <span className="text-sm text-app-text-secondary group-hover:text-white transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {errors[question.id] && <p className="text-app-danger text-[10px] uppercase font-bold">Please select an option</p>}
    </div>
  );
};

export const CheckboxGroup: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-white/90">
        {question.title} {question.is_required && <span className="text-app-danger">*</span>}
      </label>
      {question.description && <p className="text-[10px] text-app-text-muted uppercase tracking-wider leading-tight">{question.description}</p>}
      <div className="space-y-1.5">
        {question.options?.map((option: any) => (
          <label key={option.id} className="flex items-center gap-2.5 group cursor-pointer">
            <input
              type="checkbox"
              value={option.value}
              {...register(question.id, { required: question.is_required })}
              className="w-3.5 h-3.5 rounded border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20"
            />
            <span className="text-sm text-app-text-secondary group-hover:text-white transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {errors[question.id] && <p className="text-app-danger text-[10px] uppercase font-bold">Please select at least one</p>}
    </div>
  );
};

export const DropdownField: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        {question.title} {question.is_required && <span className="text-app-danger">*</span>}
      </label>
      <select
        {...register(question.id, { required: question.is_required })}
        className="w-full glass-input px-3.5 py-2 text-sm"
      >
        <option value="">Select an option</option>
        {question.options?.map((option: any) => (
          <option key={option.id} value={option.value} className="bg-app-surface">{option.label}</option>
        ))}
      </select>
      {errors[question.id] && <p className="text-app-danger text-[10px] uppercase font-bold">This field is required</p>}
    </div>
  );
};
