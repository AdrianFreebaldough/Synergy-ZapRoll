import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    const [isShake, setIsShake] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (error && !isFocused) {
        setIsShake(true);
        const timer = setTimeout(() => setIsShake(false), 400);
        return () => clearTimeout(timer);
      }
    }, [error, isFocused]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      if (props.onBlur) props.onBlur(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) props.onFocus(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
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
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-2.5 text-sm glass-input pr-10",
              icon && "pl-10",
              error && "border-app-danger/50 focus:border-app-danger/50",
              !error && hasValue && "border-app-success/50 focus:border-app-success/50",
              className
            )}
            {...props}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {error ? (
              <AlertCircle size={16} className="text-app-danger animate-in zoom-in" />
            ) : hasValue ? (
              <CheckCircle size={16} className="text-app-success animate-in zoom-in" />
            ) : null}
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

Input.displayName = 'Input';
export default Input;
