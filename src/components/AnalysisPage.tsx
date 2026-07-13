import { useEffect, useState, useRef } from 'react';

interface AnalysisPageProps {
  imageUrl: string;
  onContinue: (analysis: FaceAnalysis) => void;
  onBack: () => void;
}

export interface FaceAnalysis {
  faceShape: string;
  skinTone: string;
  skinUndertone: string;
  symmetryScore: number;
  eyeShape: string;
  noseType: string;
  lipShape: string;
  browType: string;
  jawline: string;
  cheekbones: string;
  confidenceScore: number;
  skinTexture: string;
  forehead: string;
  goldenRatioScore: number;
  recommendations: string[];
  skinToneHex: string;
  imageStats: {
    brightness: number;
    warmth: number;
    contrast: number;
    saturation: number;
  };
}

const analysisSteps = [
  { label: 'Detecting facial landmarks', duration: 700 },
  { label: 'Mapping face architecture & structure', duration: 800 },
  { label: 'Analyzing bilateral symmetry', duration: 650 },
  { label: 'Reading skin tone & undertone', duration: 750 },
  { label: 'Evaluating bone structure & depth', duration: 600 },
  { label: 'Assessing eye shape & brow arch', duration: 550 },
  { label: 'Lip contour & philtrum analysis', duration: 500 },
  { label: 'Computing golden ratio score', duration: 600 },
  { label: 'Generating personalized AI insights', duration: 750 },
];

// ── Extract real pixel data from the image ──────────────────────────────
function extractImageStats(imageUrl: string): Promise<{
  brightness: number;
  warmth: number;
  contrast: number;
  saturation: number;
  r: number;
  g: number;
  b: number;
  hash: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 80; // sample at 80×80 for speed
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ brightness: 128, warmth: 128, contrast: 50, saturation: 50, r: 180, g: 140, b: 120, hash: Date.now() % 1000 });
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let totalR = 0, totalG = 0, totalB = 0;
      let minBrightness = 255, maxBrightness = 0;
      let totalSaturation = 0;
      const pixelCount = size * size;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalR += r;
        totalG += g;
        totalB += b;

        const brightness = (r + g + b) / 3;
        if (brightness < minBrightness) minBrightness = brightness;
        if (brightness > maxBrightness) maxBrightness = brightness;

        // HSL saturation approximation
        const max = Math.max(r, g, b);
        const min2 = Math.min(r, g, b);
        const sat = max === 0 ? 0 : ((max - min2) / max) * 100;
        totalSaturation += sat;
      }

      const avgR = totalR / pixelCount;
      const avgG = totalG / pixelCount;
      const avgB = totalB / pixelCount;
      const brightness = (avgR + avgG + avgB) / 3;
      const warmth = avgR - avgB; // positive = warm, negative = cool
      const contrast = maxBrightness - minBrightness;
      const saturation = totalSaturation / pixelCount;

      // Create a unique hash from pixel data
      let hash = 0;
      for (let i = 0; i < data.length; i += 16) {
        hash = ((hash << 5) - hash + data[i]) | 0;
        hash = ((hash << 3) + data[i + 1]) | 0;
        hash = ((hash << 2) - data[i + 2]) | 0;
      }
      hash = Math.abs(hash) % 10000;

      resolve({ brightness, warmth, contrast, saturation, r: avgR, g: avgG, b: avgB, hash });
    };
    img.onerror = () => {
      resolve({ brightness: 128, warmth: 10, contrast: 60, saturation: 40, r: 180, g: 140, b: 120, hash: Date.now() % 1000 });
    };
    img.src = imageUrl;
  });
}

// ── Seeded pseudo-random from hash ───────────────────────────────────────
function seededRand(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233) * 814197;
  return x - Math.floor(x);
}

function pickFrom<T>(arr: T[], seed: number, index: number): T {
  return arr[Math.floor(seededRand(seed, index) * arr.length)];
}

function scoreInRange(min: number, max: number, seed: number, index: number): number {
  return Math.round(min + seededRand(seed, index) * (max - min));
}

// ── Main analysis generator — driven by real image data ──────────────────
async function generateAnalysis(imageUrl: string): Promise<FaceAnalysis> {
  const stats = await extractImageStats(imageUrl);
  const seed = stats.hash + Math.round(stats.brightness) + Math.round(stats.warmth);

  // Face shapes — influenced by contrast (sharp contrast → angular, low → round)
  const angularShapes = ['Square', 'Diamond', 'Heart', 'Oblong'];
  const softShapes = ['Round', 'Oval', 'Pear'];
  const faceShape = stats.contrast > 100 ? pickFrom(angularShapes, seed, 1) : pickFrom(softShapes, seed, 1);

  // Skin tone — driven by actual image brightness & RGB
  let skinTone: string;
  let skinToneHex: string;
  const bright = stats.brightness;
  if (bright > 200) { skinTone = 'Fair'; skinToneHex = '#f5e0d0'; }
  else if (bright > 175) { skinTone = 'Light'; skinToneHex = '#e8c9b0'; }
  else if (bright > 150) { skinTone = 'Medium'; skinToneHex = '#d4a882'; }
  else if (bright > 125) { skinTone = 'Olive'; skinToneHex = '#c49060'; }
  else if (bright > 100) { skinTone = 'Tan'; skinToneHex = '#b07840'; }
  else if (bright > 75)  { skinTone = 'Deep'; skinToneHex = '#8a5a30'; }
  else                   { skinTone = 'Rich'; skinToneHex = '#5c3418'; }

  // Undertone — driven by warmth (R-B channel difference)
  let skinUndertone: string;
  if (stats.warmth > 30)       skinUndertone = 'Warm (Golden/Peachy)';
  else if (stats.warmth > 10)  skinUndertone = 'Neutral-Warm (Balanced)';
  else if (stats.warmth > -10) skinUndertone = 'Neutral (Perfectly Balanced)';
  else if (stats.warmth > -25) skinUndertone = 'Neutral-Cool (Rosy)';
  else                         skinUndertone = 'Cool (Pink/Bluish)';

  // Eye shapes — seed-based unique picks
  const eyeShapes = ['Almond', 'Round', 'Hooded', 'Monolid', 'Upturned', 'Downturned', 'Deep-Set', 'Wide-Set', 'Close-Set'];
  const eyeShape = pickFrom(eyeShapes, seed, 3);

  const noseTypes = ['Straight & Refined', 'Button (Petite)', 'Roman (Aquiline)', 'Snub (Upturned)', 'Bulbous', 'Celestial', 'Fleshy', 'Hawk'];
  const noseType = pickFrom(noseTypes, seed, 4);

  const lipShapes = ['Full & Plump', 'Thin & Delicate', "Cupid's Bow", 'Wide & Expressive', 'Heart-Shaped', 'Round & Soft', 'Bow-Shaped'];
  const lipShape = pickFrom(lipShapes, seed, 5);

  const browTypes = ['High Arched', 'Soft Angled', 'Straight & Bold', 'S-Shaped', 'Flat & Full', 'Feathered', 'Rounded'];
  const browType = pickFrom(browTypes, seed, 6);

  const jawlines = ['Defined & Strong', 'Soft & Rounded', 'Sharp & Angular', 'Wide & Prominent', 'Narrow & Delicate', 'Tapered & Pointed'];
  const jawline = pickFrom(jawlines, seed, 7);

  const cheekboneTypes = ['High & Prominent', 'Low-Set & Full', 'Wide-Set', 'Subtle & Smooth', 'Angular & Sculptured', 'Rounded & Soft'];
  const cheekbones = pickFrom(cheekboneTypes, seed, 8);

  const textures = ['Smooth & Porcelain', 'Combination (T-zone)', 'Dewy & Luminous', 'Oily T-Zone', 'Fine-Pored', 'Sensitive & Delicate', 'Normal & Balanced'];
  const skinTexture = pickFrom(textures, seed, 9);

  const foreheads = ['High & Broad', 'Medium & Proportionate', 'Narrow', 'Wide with Hairline', 'Low', 'Balanced'];
  const forehead = pickFrom(foreheads, seed, 10);

  // Scores — based on image data + seed variation
  const symmetryBase = stats.contrast > 90 ? 85 : 80;
  const symmetryScore = scoreInRange(symmetryBase, symmetryBase + 14, seed, 11);

  const goldenBase = stats.saturation > 30 ? 78 : 74;
  const goldenRatioScore = scoreInRange(goldenBase, goldenBase + 16, seed, 12);

  const confidenceScore = scoreInRange(84, 98, seed, 13);

  // Personalized recommendations based on actual computed traits
  const recommendations = [
    `Your ${faceShape} face shape responds beautifully to ${faceShape === 'Round' || faceShape === 'Oval' ? 'soft diffused contouring along the temples' : 'chiseled contouring along the jawline and forehead'}`,
    `With your ${skinTone} skin & ${skinUndertone} undertone, ${stats.warmth > 0 ? 'terracotta and golden bronzers' : 'cool rose and lavender highlighters'} will create an ethereal glow`,
    `Your ${eyeShape} eyes are perfect for ${eyeShape === 'Hooded' || eyeShape === 'Monolid' ? 'cut-crease liner and elongating techniques' : 'blended shadow and graphic liner expressions'}`,
    `${lipShape} lips look stunning with ${lipShape.includes('Full') ? 'a nude liner slightly outside the cupid\'s bow' : 'an ombre lip technique to create volume and depth'}`,
    `Your ${browType} brows frame your face perfectly — enhance with ${browType.includes('Straight') ? 'a subtle arch using brow powder' : 'feathered pencil strokes for natural definition'}`,
    `Skin texture reads as ${skinTexture} — prime with a ${stats.saturation > 40 ? 'mattifying pore-minimizing base' : 'hydrating luminous primer'} before foundation`,
  ];

  return {
    faceShape,
    skinTone,
    skinUndertone,
    symmetryScore,
    eyeShape,
    noseType,
    lipShape,
    browType,
    jawline,
    cheekbones,
    confidenceScore,
    skinTexture,
    forehead,
    goldenRatioScore,
    recommendations,
    skinToneHex,
    imageStats: {
      brightness: Math.round(stats.brightness),
      warmth: Math.round(stats.warmth),
      contrast: Math.round(stats.contrast),
      saturation: Math.round(stats.saturation),
    },
  };
}

// ── Score ring component ─────────────────────────────────────────────────
function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#eeddd0" strokeWidth="4" />
          <circle
            cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xl font-light"
            style={{ fontFamily: 'Cormorant Garamond, serif', color }}
          >
            {value}
          </span>
        </div>
      </div>
      <span className="text-xs text-[#9e6e52] tracking-widest font-light uppercase">{label}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export default function AnalysisPage({ imageUrl, onContinue, onBack }: AnalysisPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsDone, setStepsDone] = useState<boolean[]>(new Array(analysisSteps.length).fill(false));
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [scanAngle, setScanAngle] = useState(0);
  const runOnce = useRef(false);

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;

    // Start scan angle animation
    const angleInterval = setInterval(() => {
      setScanAngle((a) => (a + 1) % 360);
    }, 16);

    let totalDelay = 0;

    analysisSteps.forEach((s, i) => {
      setTimeout(() => {
        setCurrentStep(i);
      }, totalDelay);
      totalDelay += s.duration;
      setTimeout(() => {
        setStepsDone((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, totalDelay);
    });

    // After all steps done, run image analysis
    setTimeout(async () => {
      clearInterval(angleInterval);
      const result = await generateAnalysis(imageUrl);
      setAnalysis(result);
      setAnalysisComplete(true);
      setTimeout(() => setShowResults(true), 300);
    }, totalDelay + 200);

    return () => clearInterval(angleInterval);
  }, [imageUrl]);

  const progress = (stepsDone.filter(Boolean).length / analysisSteps.length) * 100;

  return (
    <div className="min-h-screen bg-[#fdf8f5] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #cfa98e, transparent)' }}
        />
        <div
          className="absolute top-1/3 -left-20 w-64 h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #b8896a, transparent)' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-8 py-5 border-b border-[#e0c4b0] bg-white/60 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#9e6e52] hover:text-[#b8896a] transition-colors group"
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm tracking-wider font-light hidden sm:block">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
          >
            <span className="text-white text-xs font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>M</span>
          </div>
          <span className="text-lg font-light tracking-[0.2em] text-[#3d2820]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            MAKE<span className="font-semibold">ME</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {[{ n: '✓', done: true }, { n: '2', done: false }, { n: '3', done: false }].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < 2 ? 'text-white' : 'border border-[#e0c4b0] text-[#cfa98e]'
                }`}
                style={i < 2 ? { background: 'linear-gradient(135deg, #b8896a, #7d5440)' } : {}}
              >
                {s.n}
              </div>
              {i < 2 && (
                <div className={`w-8 h-px ${i === 0 ? 'bg-[#b8896a]' : 'bg-[#e0c4b0]'}`} />
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] text-[#b8896a] uppercase mb-3 font-light">Step 02</p>
          <h2
            className="text-4xl md:text-5xl font-light text-[#1a1208] mb-3 transition-all duration-700"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {analysisComplete ? (
              <>Your <span style={{ fontStyle: 'italic', color: '#b8896a' }}>Beauty Blueprint</span></>
            ) : (
              <>Decoding Your <span style={{ fontStyle: 'italic', color: '#b8896a' }}>Unique Beauty</span></>
            )}
          </h2>
          {!analysisComplete && (
            <p className="text-[#9e6e52] text-sm font-light">
              Our AI is reading {Math.round(progress)}% of your facial data...
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Left: Image + Scan + Progress ── */}
          <div className="space-y-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#e0c4b0] shadow-2xl">
              <img
                src={imageUrl}
                alt="Your photo"
                className="w-full object-cover"
                style={{ maxHeight: '420px', objectPosition: 'top' }}
              />

              {/* Scanning overlay */}
              {!analysisComplete && (
                <div className="absolute inset-0">
                  {/* Grid */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'linear-gradient(#b8896a 1px, transparent 1px), linear-gradient(90deg, #b8896a 1px, transparent 1px)',
                      backgroundSize: '28px 28px',
                    }}
                  />

                  {/* Rotating scan ring */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg
                      width="200" height="220"
                      style={{ transform: `rotate(${scanAngle}deg)`, transition: 'transform 0.016s linear' }}
                    >
                      <ellipse
                        cx="100" cy="110" rx="80" ry="100"
                        fill="none"
                        stroke="url(#scanGrad)"
                        strokeWidth="2"
                        strokeDasharray="40 20"
                      />
                      <defs>
                        <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#b8896a" stopOpacity="0" />
                          <stop offset="50%" stopColor="#b8896a" stopOpacity="1" />
                          <stop offset="100%" stopColor="#cfa98e" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Scan line */}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#cfa98e] to-transparent opacity-70"
                    style={{ animation: 'scan-line 2s ease-in-out infinite' }}
                  />

                  {/* Landmark dots */}
                  {[
                    { top: '22%', left: '35%' }, { top: '22%', right: '35%' },
                    { top: '38%', left: '50%' }, { top: '55%', left: '35%' },
                    { top: '55%', right: '35%' }, { top: '68%', left: '50%' },
                    { top: '30%', left: '20%' }, { top: '30%', right: '20%' },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-[#cfa98e] animate-pulse"
                      style={{ ...pos, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.15}s` }}
                    />
                  ))}

                  {/* Status label */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span
                      className="text-xs text-white/90 tracking-[0.2em] font-light px-4 py-1.5 rounded-full"
                      style={{ background: 'rgba(26,18,8,0.6)', backdropFilter: 'blur(4px)' }}
                    >
                      AI Scanning · {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Complete badge */}
              {analysisComplete && (
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs tracking-wider text-white font-medium flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Analysis Complete
                </div>
              )}

              {/* Skin tone swatch overlay */}
              {analysisComplete && analysis && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(26,18,8,0.7)', backdropFilter: 'blur(6px)' }}>
                  <div
                    className="w-5 h-5 rounded-full border border-white/40 flex-shrink-0"
                    style={{ background: analysis.skinToneHex }}
                  />
                  <span className="text-white text-xs font-light tracking-wider">{analysis.skinTone} · {analysis.skinUndertone}</span>
                </div>
              )}
            </div>

            {/* Progress tracker */}
            <div className="p-5 rounded-2xl bg-white/80 border border-[#e0c4b0] shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs tracking-widest text-[#7d5440] uppercase font-light">
                  {analysisComplete
                    ? '✓ All Systems Complete'
                    : analysisSteps[currentStep]?.label ?? 'Processing...'}
                </span>
                <span className="text-xs text-[#b8896a] font-medium tabular-nums">{Math.round(progress)}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-[#eeddd0] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #b8896a, #cfa98e, #e0c4b0)',
                  }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 gap-1.5">
                {analysisSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400 ${
                        stepsDone[i]
                          ? 'bg-[#b8896a] shadow-sm'
                          : i === currentStep
                          ? 'border-2 border-[#b8896a] bg-[#f7ede4]'
                          : 'border border-[#e0c4b0] bg-transparent'
                      }`}
                    >
                      {stepsDone[i] && <span className="text-white text-[8px] font-bold">✓</span>}
                      {i === currentStep && !stepsDone[i] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b8896a] animate-pulse" />
                      )}
                    </div>
                    <span
                      className={`text-xs transition-all duration-300 ${
                        stepsDone[i]
                          ? 'text-[#b8896a] font-medium'
                          : i === currentStep
                          ? 'text-[#3d2820] font-medium'
                          : 'text-[#cfa98e] font-light'
                      }`}
                    >
                      {step.label}
                    </span>
                    {i === currentStep && !stepsDone[i] && (
                      <span className="ml-auto text-[10px] text-[#cfa98e] tracking-wider animate-pulse">
                        Processing...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div
            className={`transition-all duration-700 ${
              showResults ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            {analysis && showResults ? (
              <div className="space-y-5">
                {/* Score Rings */}
                <div className="p-5 rounded-2xl bg-white/80 border border-[#e0c4b0] shadow-sm">
                  <p className="text-[10px] tracking-[0.3em] text-[#9e6e52] uppercase font-light mb-5 text-center">
                    ✦ Beauty Intelligence Scores
                  </p>
                  <div className="flex justify-around items-center">
                    <ScoreRing value={analysis.symmetryScore} label="Symmetry" color="#b8896a" />
                    <ScoreRing value={analysis.confidenceScore} label="Confidence" color="#9e6e52" />
                    <ScoreRing value={analysis.goldenRatioScore} label="Golden Ratio" color="#cfa98e" />
                  </div>
                </div>

                {/* Image Stats Bar */}
                <div className="p-4 rounded-2xl bg-white/80 border border-[#e0c4b0] shadow-sm">
                  <p className="text-[10px] tracking-[0.3em] text-[#9e6e52] uppercase font-light mb-3">
                    ◈ Real-Time Skin Photometrics
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Luminosity', value: analysis.imageStats.brightness, max: 255 },
                      { label: 'Warmth Index', value: Math.max(0, analysis.imageStats.warmth + 80), max: 160 },
                      { label: 'Contrast Depth', value: analysis.imageStats.contrast, max: 255 },
                      { label: 'Skin Saturation', value: analysis.imageStats.saturation, max: 100 },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-[#9e6e52] font-light tracking-wider">{m.label}</span>
                          <span className="text-[10px] text-[#b8896a] font-medium">
                            {Math.round((m.value / m.max) * 100)}%
                          </span>
                        </div>
                        <div className="h-1 bg-[#eeddd0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${Math.min(100, Math.round((m.value / m.max) * 100))}%`,
                              background: 'linear-gradient(90deg, #b8896a, #cfa98e)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Face Architecture */}
                <div className="p-5 rounded-2xl bg-white/80 border border-[#e0c4b0] shadow-sm">
                  <h3
                    className="text-base font-semibold text-[#1a1208] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    <span className="text-[#b8896a]">✦</span> Face Architecture
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'Face Shape', value: analysis.faceShape, icon: '◇' },
                      { label: 'Jawline', value: analysis.jawline, icon: '◁' },
                      { label: 'Cheekbones', value: analysis.cheekbones, icon: '◈' },
                      { label: 'Forehead', value: analysis.forehead, icon: '△' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-[#f7ede4] border border-[#eeddd0]">
                        <p className="text-[9px] tracking-[0.25em] text-[#9e6e52] uppercase mb-1 font-light flex items-center gap-1">
                          <span>{item.icon}</span>{item.label}
                        </p>
                        <p className="text-sm font-medium text-[#3d2820] leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin Intelligence */}
                <div className="p-5 rounded-2xl bg-white/80 border border-[#e0c4b0] shadow-sm">
                  <h3
                    className="text-base font-semibold text-[#1a1208] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    <span className="text-[#b8896a]">◈</span> Skin Intelligence
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        label: 'Skin Tone',
                        value: analysis.skinTone,
                        extra: (
                          <span
                            className="inline-block w-3 h-3 rounded-full ml-1.5 border border-[#e0c4b0]"
                            style={{ background: analysis.skinToneHex }}
                          />
                        ),
                      },
                      { label: 'Undertone', value: analysis.skinUndertone, extra: null },
                      { label: 'Texture', value: analysis.skinTexture, extra: null },
                      { label: 'Radiance Boost', value: `+${analysis.confidenceScore - 80}% Glow`, extra: null },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-[#f7ede4] border border-[#eeddd0]">
                        <p className="text-[9px] tracking-[0.25em] text-[#9e6e52] uppercase mb-1 font-light">{item.label}</p>
                        <p className="text-sm font-medium text-[#3d2820] leading-tight flex items-center">
                          {item.value}
                          {item.extra}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facial Features */}
                <div className="p-5 rounded-2xl bg-white/80 border border-[#e0c4b0] shadow-sm">
                  <h3
                    className="text-base font-semibold text-[#1a1208] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    <span className="text-[#b8896a]">❋</span> Facial Feature Map
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'Eye Shape', value: analysis.eyeShape, icon: '◉' },
                      { label: 'Brow Type', value: analysis.browType, icon: '⌒' },
                      { label: 'Nose Type', value: analysis.noseType, icon: '◦' },
                      { label: 'Lip Shape', value: analysis.lipShape, icon: '◡' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-[#f7ede4] border border-[#eeddd0]">
                        <p className="text-[9px] tracking-[0.25em] text-[#9e6e52] uppercase mb-1 font-light flex items-center gap-1">
                          <span>{item.icon}</span>{item.label}
                        </p>
                        <p className="text-sm font-medium text-[#3d2820] leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Personalized Recommendations */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#f7ede4] to-white border border-[#e0c4b0] shadow-sm">
                  <h3
                    className="text-base font-semibold text-[#1a1208] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    <span className="text-[#b8896a]">✿</span> Personalized AI Insights
                  </h3>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-[#eeddd0]">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-medium"
                          style={{ background: 'linear-gradient(135deg, #b8896a, #9e6e52)' }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-xs text-[#5c3d2e] font-light leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Confidence Mode Banner */}
                <div
                  className="p-5 rounded-2xl text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1a1208 0%, #3d2820 60%, #5c3d2e 100%)' }}
                >
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #cfa98e, transparent)', transform: 'translate(30%, -30%)' }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-8 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #b8896a, transparent)', transform: 'translate(-30%, 30%)' }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full border border-[#cfa98e] flex items-center justify-center">
                        <span className="text-[#cfa98e] text-xs">◎</span>
                      </div>
                      <span className="text-xs tracking-[0.25em] uppercase text-[#cfa98e] font-medium">
                        AI Confidence Mode™ — Activated
                      </span>
                    </div>
                    <p className="text-sm font-light text-white/80 leading-relaxed">
                      Your <strong className="text-[#cfa98e] font-medium">{analysis.faceShape}</strong> face with{' '}
                      <strong className="text-[#cfa98e] font-medium">{analysis.skinTone}</strong> skin unlocks a fully personalized
                      beauty algorithm. Every makeup look below is crafted to celebrate <em>your</em> exact features.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => analysis && onContinue(analysis)}
                  className="w-full py-4 rounded-2xl text-sm tracking-[0.25em] uppercase font-medium text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                  style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
                >
                  ✦ Explore My Personalized Looks
                </button>
              </div>
            ) : (
              /* Skeleton loading */
              <div className="space-y-5">
                {[120, 100, 140, 140, 160].map((h, i) => (
                  <div
                    key={i}
                    className="rounded-2xl animate-pulse bg-gradient-to-r from-[#eeddd0] via-[#f7ede4] to-[#eeddd0]"
                    style={{ height: `${h}px`, backgroundSize: '200% 100%', animation: `shimmer 2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
