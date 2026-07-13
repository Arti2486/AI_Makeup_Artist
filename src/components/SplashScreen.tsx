import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'fade'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 800);
    const t2 = setTimeout(() => setPhase('fade'), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2e2015 50%, #3d2820 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #cfa98e, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #b8896a, transparent)' }} />

      {/* Logo */}
      <div className={`flex flex-col items-center transition-all duration-700 ${phase !== 'logo' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-glow"
          style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
          <span className="text-5xl font-light text-white" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>M</span>
        </div>
        <h1 className="text-6xl font-light text-white tracking-[0.3em]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          MAKE<span className="text-[#b8896a] italic">ME</span>
        </h1>
      </div>

      {/* Tagline */}
      <div className={`mt-6 text-center transition-all duration-700 delay-200 ${phase === 'tagline' || phase === 'fade' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#b8896a]" />
          <span className="text-[#cfa98e] text-sm">✦</span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#b8896a]" />
        </div>
        <p className="text-[#cfa98e] text-xs tracking-[0.4em] uppercase font-light">AI Digital Makeup Artist</p>
      </div>

      {/* Loading dots */}
      <div className={`absolute bottom-16 flex gap-2 transition-all duration-500 ${phase !== 'logo' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="dot" style={{ background: '#b8896a' }} />
        <span className="dot" style={{ background: '#b8896a' }} />
        <span className="dot" style={{ background: '#b8896a' }} />
      </div>
    </div>
  );
}
