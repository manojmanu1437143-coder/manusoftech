import React from 'react';

interface LogoProps {
  className?: string;
  glow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-12 h-12", 
  glow = true
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className} transition-transform duration-500 hover:scale-110 group`}>
      {/* High-end holographic glowing backplate */}
      {glow && (
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      
      <svg 
        className="relative z-10 w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]"
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyberBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0b3fa8" />
            <stop offset="60%" stopColor="#1e5bf0" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="cyberCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c8ff" />
            <stop offset="100%" stopColor="#0055ff" />
          </linearGradient>
          {glow && (
            <filter id="neonGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* 1. Left Pillar & Outer Chevron Fold (Deep Cyber Blue) */}
        <path 
          d="M26 73 V33 L48 55" 
          stroke="url(#cyberBlueGrad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* 2. Left Inside Parallel Fold (Symmetrical Offset Chevron) */}
        <path 
          d="M26 53 L37 64 L48 53" 
          stroke="url(#cyberBlueGrad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* 3. Center Technical Connection Trace with Circuit Node (Cyan) */}
        <path 
          d="M45 58 L57 46" 
          stroke="url(#cyberCyanGrad)" 
          strokeWidth="5" 
          strokeLinecap="round"
        />
        <circle 
          cx="57" 
          cy="46" 
          r="4" 
          fill="url(#cyberCyanGrad)" 
          stroke="#FFFFFF" 
          strokeWidth="1.5"
          filter={glow ? "url(#neonGlowEffect)" : undefined}
        />

        {/* 4. Right Inside Parallel Fold (Symmetrical Offset Chevron) */}
        <path 
          d="M52 53 L63 64 M63 64 L74 53" 
          stroke="url(#cyberCyanGrad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* 5. Right Pillar & Chevron Fold (Vibrant Cyan) */}
        <path 
          d="M52 55 L74 33 V73" 
          stroke="url(#cyberCyanGrad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* 6. Top-Right Symmetrical Tech Arrow Pointing ↗ (Innovation Motif) */}
        <path 
          d="M74 33 L84 23" 
          stroke="url(#cyberCyanGrad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M73 23 H84 V34" 
          stroke="url(#cyberCyanGrad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};



