import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, ...props }, ref) => {
    return (
      <div className="w-full group">
        <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-2.5 text-sm glass-input",
              error && "border-red-500/50",
              className
            )}
            {...props}
          >
            <option value="" className="bg-[#0f172a] text-white">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-focus-within:text-app-primary transition-colors">
            <ChevronDown size={14} />
          </div>
        </div>
        {error && (
          <p className="text-red-400 text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-tight animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
