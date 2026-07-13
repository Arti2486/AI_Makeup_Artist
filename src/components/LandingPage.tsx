import { useEffect, useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const particles = [
  { top: '10%', left: '5%', size: 6, delay: 0, opacity: 0.4 },
  { top: '20%', left: '90%', size: 4, delay: 0.5, opacity: 0.3 },
  { top: '50%', left: '3%', size: 8, delay: 1, opacity: 0.25 },
  { top: '75%', left: '92%', size: 5, delay: 1.5, opacity: 0.35 },
  { top: '85%', left: '15%', size: 6, delay: 0.8, opacity: 0.3 },
  { top: '35%', left: '95%', size: 3, delay: 2, opacity: 0.4 },
  { top: '60%', left: '8%', size: 4, delay: 0.3, opacity: 0.3 },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf8f5]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #cfa98e, transparent)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #b8896a, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #9e6e52, transparent)' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#b8896a 1px, transparent 1px), linear-gradient(90deg, #b8896a 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

        {/* Particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              background: '#b8896a',
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
            <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>M</span>
          </div>
          <span className="text-xl font-light tracking-[0.2em] text-[#3d2820]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            MAKE<span className="font-semibold">ME</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Gallery'].map(item => (
            <a key={item} href="#" className="text-sm tracking-wider text-[#7d5440] hover:text-[#b8896a] transition-colors font-light">
              {item}
            </a>
          ))}
        </nav>
        <button
          onClick={onGetStarted}
          className="btn-nude px-6 py-2.5 rounded-full text-sm tracking-wider font-light"
        >
          Try Now
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e0c4b0] bg-white/60 backdrop-blur-sm mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#b8896a] animate-pulse" />
          <span className="text-xs tracking-[0.2em] text-[#9e6e52] font-medium uppercase">AI-Powered Beauty Intelligence</span>
        </div>

        {/* Main Title */}
        <h1
          className={`text-7xl md:text-9xl font-light tracking-wider mb-4 transition-all duration-1000 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1208' }}
        >
          Make<span style={{ fontStyle: 'italic', color: '#b8896a' }}>Me</span>
        </h1>

        <p
          className={`text-base md:text-lg tracking-[0.3em] text-[#7d5440] font-light uppercase mb-6 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Your AI Digital Makeup Artist
        </p>

        {/* Divider */}
        <div className={`flex items-center gap-4 mb-8 transition-all duration-1000 delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#b8896a]" />
          <span className="text-[#cfa98e] text-sm">✦</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#b8896a]" />
        </div>

        {/* Description */}
        <p
          className={`max-w-xl text-center text-[#5c3d2e] text-base leading-relaxed font-light mb-12 transition-all duration-1000 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Discover your perfect look with AI-powered face analysis, personalized makeup recommendations, and step-by-step professional tutorials crafted uniquely for you.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center gap-4 mb-16 transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={onGetStarted}
            className="btn-nude px-10 py-4 rounded-full text-sm tracking-[0.2em] uppercase font-medium shadow-xl"
          >
            Analyze My Face
          </button>
          <button className="btn-outline-nude px-10 py-4 rounded-full text-sm tracking-[0.2em] uppercase font-medium">
            View Gallery
          </button>
        </div>

        {/* Feature Pills */}
        <div className={`flex flex-wrap justify-center gap-3 transition-all duration-1000 delay-600 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {[
            '✦ Face Structure Analysis',
            '✦ Skin Tone Detection',
            '✦ AI Confidence Mode',
            '✦ Personalized Looks',
            '✦ Step-by-Step Tutorials',
          ].map(f => (
            <span
              key={f}
              className="px-4 py-2 rounded-full text-xs tracking-wider text-[#7d5440] border border-[#e0c4b0] bg-white/50 backdrop-blur-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light text-[#1a1208] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            The <span style={{ fontStyle: 'italic', color: '#b8896a' }}>Intelligence</span> Behind Beauty
          </h2>
          <p className="text-[#7d5440] font-light text-sm tracking-widest uppercase">
            What makes MakeMe extraordinary
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '◎',
              title: 'Face Architecture',
              desc: 'Advanced AI maps 468 facial landmarks to analyze your unique bone structure, symmetry, and proportions with clinical precision.',
              delay: 0,
            },
            {
              icon: '◈',
              title: 'Skin Intelligence',
              desc: 'Multi-spectral skin tone analysis identifies your undertones, texture, and hydration levels to recommend perfect product shades.',
              delay: 100,
            },
            {
              icon: '✦',
              title: 'AI Confidence Mode',
              desc: 'Our exclusive algorithm boosts your natural features with makeup that enhances what makes you uniquely beautiful.',
              delay: 200,
            },
            {
              icon: '❋',
              title: 'Look Curator',
              desc: 'From bridal elegance to everyday chic — AI curates dozens of makeup styles personalized to your face shape and skin tone.',
              delay: 300,
            },
            {
              icon: '◐',
              title: 'Step-by-Step Artist',
              desc: 'Professional makeup tutorials broken into easy steps with product recommendations, timing, and pro tips.',
              delay: 400,
            },
            {
              icon: '✿',
              title: 'AI Beauty Assistant',
              desc: '24/7 intelligent beauty consultant answering all your makeup, skincare, and style questions with expert knowledge.',
              delay: 500,
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="makeup-card p-8 rounded-2xl bg-white/60 border border-[#e0c4b0] backdrop-blur-sm"
              style={{ animationDelay: `${feat.delay}ms` }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #f7ede4, #eeddd0)' }}>
                <span className="text-[#b8896a] text-xl">{feat.icon}</span>
              </div>
              <h3 className="text-xl font-medium text-[#1a1208] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {feat.title}
              </h3>
              <p className="text-sm text-[#7d5440] leading-relaxed font-light">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-24" style={{ background: 'linear-gradient(135deg, #f7ede4, #fdf8f5)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-light text-[#1a1208] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Journey to <span style={{ fontStyle: 'italic', color: '#b8896a' }}>Radiance</span>
          </h2>
          <p className="text-[#7d5440] font-light text-sm tracking-widest uppercase mb-16">Three simple steps</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-[#b8896a] to-[#b8896a]" />
            {[
              { num: '01', title: 'Upload or Capture', desc: 'Share a selfie or use live camera for real-time face detection and analysis.' },
              { num: '02', title: 'AI Analysis', desc: 'Our AI maps your face structure, symmetry, skin tone, and unique features.' },
              { num: '03', title: 'Get Your Look', desc: 'Receive personalized makeup looks with professional step-by-step tutorials.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 relative z-10"
                  style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
                  <span className="text-white text-sm font-light tracking-widest">{step.num}</span>
                </div>
                <h3 className="text-xl font-medium text-[#1a1208] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{step.title}</h3>
                <p className="text-sm text-[#7d5440] leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-6xl font-light text-[#1a1208] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Ready to Unveil Your <br />
            <span style={{ fontStyle: 'italic', color: '#b8896a' }}>True Beauty?</span>
          </h2>
          <p className="text-[#7d5440] font-light mb-10 leading-relaxed">
            Join thousands of women discovering their most confident, radiant selves with MakeMe's AI-powered beauty intelligence.
          </p>
          <button
            onClick={onGetStarted}
            className="btn-nude px-14 py-5 rounded-full text-sm tracking-[0.25em] uppercase font-medium shadow-2xl animate-glow"
          >
            Begin Your Transformation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 border-t border-[#e0c4b0] flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm text-[#9e6e52] tracking-widest font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          MAKEME © 2025
        </span>
        <span className="text-xs text-[#cfa98e] tracking-wider">AI Digital Makeup Artist · Powered by Beauty Intelligence</span>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="text-xs text-[#9e6e52] hover:text-[#b8896a] tracking-wider transition-colors">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
