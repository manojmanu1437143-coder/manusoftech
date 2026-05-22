import React, { useRef, useState } from 'react';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tiltStyle, setTiltStyle] = useState<string>('rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    // Calculate mouse position relative to card centre (-0.5 to 0.5 range)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Constrain tilt angle (e.g. max 12 degrees)
    const tiltX = -y * 12;
    const tiltY = x * 12;

    setTiltStyle(`perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`);
  };

  const handleMouseLeave = () => {
    setTiltStyle('perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: tiltStyle, transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)' }}
      className="relative overflow-hidden rounded-2xl bg-white/5 border border-sky-400/20 hover:border-cyan-400/50 hover:shadow-[0_20px_50px_rgba(0,212,255,0.12)] p-8 transition-colors duration-300 cursor-default group"
    >
      {/* Decorative background glow radial circle */}
      <div className="absolute -inset-20 bg-radial from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-cyan-400/30 flex items-center justify-center text-3xl mb-5 shadow-[0_4px_20px_rgba(0,212,255,0.1)] group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-exo font-bold text-xl mb-3 text-white tracking-wide group-hover:text-cyan-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-400 font-rajdhani text-[1.05rem] leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {/* Futuristic accent bottom gradient stripe */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-blue-600 to-cyan-400 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl" />
    </div>
  );
};
