import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Professional error page shown when a token validation fails.
 */
const InvalidLink: React.FC = () => {

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="glass-card p-10 md:p-14 text-center max-w-lg border-t-4 border-t-app-danger shadow-2xl relative overflow-hidden group">
        {/* Background glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-app-danger/10 rounded-full blur-3xl group-hover:bg-app-danger/20 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-app-danger/10 rounded-2xl border border-app-danger/20">
              <ShieldAlert className="w-14 h-14 text-app-danger animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">
            Access Denied
          </h1>
          
          <div className="h-1 w-20 bg-app-danger/30 mx-auto mb-8 rounded-full"></div>
          
          <p className="text-app-text-secondary text-base leading-relaxed mb-10 font-medium">
            The link you are trying to access is <span className="text-app-danger">invalid, unauthorized,</span> or has been manually tampered with. 
            Access is restricted to official QR codes provided during the Synergy event.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvalidLink;
