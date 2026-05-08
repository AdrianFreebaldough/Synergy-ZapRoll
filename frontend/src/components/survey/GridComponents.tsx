import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SurveyQuestion } from '../../types/survey';
import { cn } from '../../utils/cn';

interface QuestionProps {
  question: SurveyQuestion;
}

export const LikertTable: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  const rows = question.config?.rows || [];
  const cols = question.config?.cols || [];

  return (
    <div className="space-y-3 overflow-x-auto pb-2">
      <div className="min-w-[500px]">
        <label className="block text-sm font-semibold text-white/90 mb-2.5">
          {question.title} {question.is_required && <span className="text-app-danger">*</span>}
        </label>
        <table className="w-full text-left border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="p-2.5 text-[10px] uppercase tracking-widest text-app-text-muted font-bold">Statement</th>
              {cols.map((col: any) => (
                <th key={col.id} className="p-2.5 text-center text-[10px] uppercase tracking-widest text-app-text-muted font-bold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="glass-card bg-white/[0.02]">
                <td className="p-3 text-sm text-app-text-secondary font-medium">{row.label}</td>
                {cols.map((col: any) => (
                  <td key={col.id} className="p-3 text-center">
                    <input
                      type="radio"
                      value={col.value || col.id}
                      {...register(`${question.id}.${row.id}`, { required: question.is_required })}
                      className="w-3.5 h-3.5 border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {errors[question.id] && (
          <p className="text-app-danger text-[10px] uppercase font-bold mt-1.5">Please answer all statements</p>
        )}
      </div>
    </div>
  );
};

export const GridTable: React.FC<QuestionProps> = ({ question }) => {
  const { register, formState: { errors } } = useFormContext();
  const rows = question.config?.rows || [];
  const cols = question.config?.cols || [];
  const isCheckbox = question.type === 'grid_checkbox';

  return (
    <div className="space-y-3 overflow-x-auto pb-2">
      <div className="min-w-[500px]">
        <label className="block text-sm font-semibold text-white/90 mb-2.5">
          {question.title} {question.is_required && <span className="text-app-danger">*</span>}
        </label>
        <table className="w-full text-left border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="p-2.5 text-[10px] uppercase tracking-widest text-app-text-muted font-bold">Row</th>
              {cols.map((col: any) => (
                <th key={col.id} className="p-2.5 text-center text-[10px] uppercase tracking-widest text-app-text-muted font-bold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="glass-card bg-white/[0.02]">
                <td className="p-3 text-sm text-app-text-secondary font-medium">{row.label}</td>
                {cols.map((col: any) => (
                  <td key={col.id} className="p-3 text-center">
                    <input
                      type={isCheckbox ? 'checkbox' : 'radio'}
                      value={col.value || col.id}
                      {...register(`${question.id}.${row.id}`, { required: question.is_required })}
                      className={cn(
                        "w-3.5 h-3.5 border-app-border bg-app-surface text-app-primary focus:ring-app-primary/20",
                        isCheckbox ? "rounded" : "rounded-full"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
