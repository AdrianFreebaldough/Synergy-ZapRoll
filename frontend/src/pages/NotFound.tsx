import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in duration-700">
      <div className="glass-card p-10 max-w-sm">
        <div className="text-6xl font-bold text-app-primary mb-4 opacity-50">404</div>
        <h1 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Page Not Found</h1>
        <p className="text-app-text-secondary text-sm mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/register/student')}
          className="w-full py-3.5 bg-app-primary text-white font-bold rounded-xl hover:bg-app-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-[10px]"
        >
          Back to Portal
        </button>
      </div>
    </div>
  );
};

export default NotFound;
