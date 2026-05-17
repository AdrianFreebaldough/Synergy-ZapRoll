import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading = false,
  loadingText = 'Processing...',
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "relative flex items-center justify-center font-bold rounded-xl transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]";

  const variants = {
    primary: "bg-app-primary text-white hover:bg-app-accent shadow-lg shadow-app-primary/10",
    secondary: "bg-white/[0.05] text-white border border-white/10 hover:bg-white/[0.1]",
    danger: "bg-app-danger text-white hover:bg-red-600",
    ghost: "bg-transparent text-app-text-muted hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-[9px]",
    md: "px-6 py-3 text-[10px]",
    lg: "px-8 py-3.5 text-[11px]",
    xl: "px-10 py-4 text-[12px]"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      <div className={`flex items-center justify-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        {children}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[10px] md:text-[11px]">{loadingText}</span>
        </div>
      )}
    </button>
  );
};

export default LoadingButton;
