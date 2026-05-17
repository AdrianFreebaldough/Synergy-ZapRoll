import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, icon, className, ...props }, ref) => {
    const [isShake, setIsShake] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
      if (error) {
        setIsShake(true);
        const timer = setTimeout(() => setIsShake(false), 400);
        return () => clearTimeout(timer);
      }
    }, [error]);

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setHasValue(e.target.value !== '');
      if (props.onBlur) props.onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setHasValue(e.target.value !== '');
      if (props.onChange) props.onChange(e);
    };

    return (
      <div className={cn("w-full group", isShake && "animate-shake")}>
        <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary pointer-events-none z-10">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-2.5 text-sm glass-input pr-10 appearance-none",
              icon && "pl-10",
              error && "border-app-danger/50 focus:border-app-danger/50",
              !error && hasValue && "border-app-success/50 focus:border-app-success/50",
              className
            )}
            {...props}
            onBlur={handleBlur}
            onChange={handleChange}
          >
            <option value="" className="bg-[#0f172a] text-white">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {error ? (
              <AlertCircle size={16} className="text-app-danger animate-in zoom-in" />
            ) : hasValue ? (
              <CheckCircle size={16} className="text-app-success animate-in zoom-in" />
            ) : (
              <ChevronDown size={14} className="text-white/30 group-focus-within:text-app-primary transition-colors" />
            )}
          </div>
        </div>
        {error && (
          <p className="text-app-danger text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-tight animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
