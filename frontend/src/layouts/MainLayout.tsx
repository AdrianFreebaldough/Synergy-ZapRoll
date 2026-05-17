import React from 'react';
import qcuLogo from '@assets/qcuLOGONOBG.jpg';
import synergyLogo from '@assets/SynergyLogo.png';
import ccsLogo from '@assets/ccsLOGO.png';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative font-sans text-app-text-primary flex flex-col items-center">
      {/* Modern SaaS Dark Gradient Background */}
      <div className="qcu-background" />
      
      {/* Header Area: Clean Professional Dual Logo */}
      <header className="relative z-10 pt-12 pb-8 flex flex-col items-center w-full px-4">
        <div className="flex items-center justify-center gap-4 md:gap-8 animate-in fade-in zoom-in duration-1000">
          <img 
            src={qcuLogo} 
            alt="QCU Logo" 
            className="h-10 md:h-14 w-auto max-w-[80px] md:max-w-none opacity-90 transition-all hover:opacity-100 hover:scale-105"
          />
          <div className="h-8 md:h-12 w-px bg-app-border/50" />
          <img 
            src={synergyLogo} 
            alt="Synergy Logo" 
            className="h-10 md:h-14 w-auto max-w-[80px] md:max-w-none opacity-90 transition-all hover:opacity-100 hover:scale-105"
          />
          <div className="h-8 md:h-12 w-px bg-app-border/50" />
          <img 
            src={ccsLogo} 
            alt="CCS Logo" 
            className="h-10 md:h-14 w-auto max-w-[80px] md:max-w-none opacity-90 transition-all hover:opacity-100 hover:scale-105"
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-[11px] md:text-xs text-app-text-secondary font-semibold uppercase tracking-[0.4em]">
            Registration System
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full px-4 pb-16 max-w-[740px]">
        <div className="animate-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto pb-8 relative z-10 text-app-text-muted text-[10px] tracking-widest uppercase font-medium">
        © Adrian Frivaldo | Erickson Guhilde
      </footer>
    </div>
  );
};

export default MainLayout;
