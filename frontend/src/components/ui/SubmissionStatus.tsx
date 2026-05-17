import React from 'react';

interface SubmissionStatusProps {
  type: 'success' | 'already-submitted' | 'capacity-full';
  title: string;
  message: React.ReactNode;
  category?: string;
  onAction?: () => void;
  actionText?: string;
}

const SubmissionStatus: React.FC<SubmissionStatusProps> = ({
  type,
  title,
  message,
  onAction,
  actionText
}) => {
  const isSuccess = type === 'success';
  const isFull = type === 'capacity-full';

  return (
    <div className={`glass-card p-10 md:p-14 text-center animate-in zoom-in fade-in duration-500 shadow-2xl border-t-8 ${
      isFull ? 'border-t-app-danger' : 'border-t-app-primary'
    }`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 shadow-lg ${
        isSuccess 
          ? 'bg-app-success/10 text-app-success border-app-success/20 shadow-app-success/10' 
          : isFull
          ? 'bg-app-danger/10 text-app-danger border-app-danger/20 shadow-app-danger/10'
          : 'bg-app-primary/10 text-app-primary border-app-primary/20 shadow-app-primary/10'
      }`}>
        {isSuccess ? (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : isFull ? (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-tight">
        {title}
      </h2>
      
      <div className="text-app-text-secondary text-sm md:text-base leading-relaxed max-w-sm mx-auto opacity-80 flex flex-col gap-4">
        {message}
      </div>

      <div className="mt-10 pt-8 border-t border-white/[0.04]">
        {onAction ? (
          <button 
            onClick={onAction}
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-app-primary hover:text-app-accent transition-all hover:scale-105 active:scale-95 py-2 px-4"
          >
            {actionText || 'Return to Home'}
          </button>
        ) : (
          <p className="text-[10px] md:text-[11px] text-app-text-muted uppercase tracking-[0.3em] font-medium">
            Portal Managed by Synergy Team
          </p>
        )}
      </div>
    </div>
  );
};

export default SubmissionStatus;
