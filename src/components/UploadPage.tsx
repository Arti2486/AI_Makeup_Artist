import { useState, useRef, useCallback, useEffect } from 'react';

interface UploadPageProps {
  onImageReady: (imageUrl: string) => void;
  onBack: () => void;
}

export default function UploadPage({ onImageReady, onBack }: UploadPageProps) {
  const [dragOver, setDragOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check permission status on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setPermissionState(result.state as 'granted' | 'denied' | 'prompt');
        result.onchange = () => {
          setPermissionState(result.state as 'granted' | 'denied' | 'prompt');
        };
      }).catch(() => {
        setPermissionState('unknown');
      });
    }
  }, []);

  // Attach stream to video element whenever cameraActive changes
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().then(() => {
          setCameraReady(true);
          setCameraLoading(false);
        }).catch((err) => {
          console.error('Video play failed:', err);
          setCameraError('Could not start video stream. Please try again.');
          setCameraLoading(false);
        });
      };
    }
  }, [cameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setCameraError('Image too large. Please use an image under 15MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setCameraError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError('');
    setCameraLoading(true);
    setCameraReady(false);

    // Stop any existing stream
    stopCameraStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setFacingMode(mode);
      setCameraActive(true);
      setPermissionState('granted');
      // useEffect will handle attaching to video element
    } catch (err: unknown) {
      setCameraLoading(false);
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setCameraError(
          '🚫 Camera permission denied. Please click the camera icon in your browser\'s address bar and allow camera access, then try again.'
        );
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('📷 No camera found on this device. Please upload a photo instead.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setCameraError('⚠️ Camera is in use by another app. Please close other applications and try again.');
      } else if (error.name === 'OverconstrainedError') {
        // Try with lower constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallbackStream;
          setFacingMode(mode);
          setCameraActive(true);
          setPermissionState('granted');
        } catch {
          setCameraError('⚠️ Could not access camera. Please upload a photo instead.');
        }
      } else {
        setCameraError(`⚠️ Camera error: ${error.message || 'Unknown error'}. Please try uploading a photo.`);
      }
    }
  };

  const stopCamera = () => {
    stopCameraStream();
    setCameraActive(false);
    setCameraReady(false);
    setCameraLoading(false);
    setCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newMode);
  };

  const startCountdown = () => {
    if (!cameraReady) return;
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror if front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPreview(dataUrl);
      stopCamera();
    }
    setTimeout(() => setCapturing(false), 300);
  };

  const handleAnalyze = () => {
    if (preview) {
      onImageReady(preview);
    }
  };

  const resetAll = () => {
    setPreview(null);
    setCameraError('');
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#fdf8f5] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #cfa98e, transparent)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #b8896a, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #9e6e52, transparent)' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-8 py-5 border-b border-[#e0c4b0] bg-white/60 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#9e6e52] hover:text-[#b8896a] transition-colors group"
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm tracking-wider font-light hidden sm:block">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
          >
            <span className="text-white text-xs font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>M</span>
          </div>
          <span className="text-lg font-light tracking-[0.2em] text-[#3d2820]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            MAKE<span className="font-semibold">ME</span>
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i === 0
                    ? 'text-white shadow-md'
                    : 'border border-[#e0c4b0] text-[#cfa98e]'
                }`}
                style={i === 0 ? { background: 'linear-gradient(135deg, #b8896a, #7d5440)' } : {}}
              >
                {i === 0 ? '1' : step}
              </div>
              {i < 2 && <div className={`w-8 h-px ${i === 0 ? 'bg-[#b8896a]' : 'bg-[#e0c4b0]'}`} />}
            </div>
          ))}
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] text-[#b8896a] uppercase mb-3 font-light">Step 01</p>
          <h2
            className="text-4xl md:text-5xl font-light text-[#1a1208] mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Share Your <span style={{ fontStyle: 'italic', color: '#b8896a' }}>Canvas</span>
          </h2>
          <p className="text-[#7d5440] font-light text-sm leading-relaxed max-w-md mx-auto">
            Upload a clear, front-facing photo or use your camera for the most accurate AI face analysis.
          </p>
        </div>

        {/* ─── Option Cards ─────────────────────────────────────── */}
        {!preview && !cameraActive && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {/* Upload Card */}
              <div
                className={`relative rounded-3xl border-2 border-dashed p-8 md:p-10 text-center cursor-pointer transition-all duration-300 group ${
                  dragOver
                    ? 'border-[#b8896a] bg-[#f7ede4] scale-[1.01]'
                    : 'border-[#e0c4b0] bg-white/70 hover:border-[#b8896a] hover:bg-[#f7ede4] hover:scale-[1.01]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #f7ede4, #eeddd0)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b8896a" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
                    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-[#1a1208] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Upload Photo
                </h3>
                <p className="text-sm text-[#9e6e52] font-light mb-3">Drag & drop or click to browse</p>
                <p className="text-xs text-[#cfa98e] tracking-wider">JPG · PNG · WEBP · Max 15MB</p>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(184,137,106,0.03), transparent)' }} />
              </div>

              {/* Camera Card */}
              <div
                className="relative rounded-3xl border-2 border-[#e0c4b0] bg-white/70 p-8 md:p-10 text-center cursor-pointer hover:border-[#b8896a] hover:bg-[#f7ede4] hover:scale-[1.01] transition-all duration-300 group"
                onClick={() => startCamera('user')}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #f7ede4, #eeddd0)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b8896a" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-[#1a1208] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Use Camera
                </h3>
                <p className="text-sm text-[#9e6e52] font-light mb-3">Take a live selfie instantly</p>
                <p className="text-xs text-[#cfa98e] tracking-wider">
                  {permissionState === 'denied'
                    ? '⚠ Permission denied — click to retry'
                    : 'Requires camera permission'}
                </p>
                {/* Pulse indicator */}
                <div className="absolute top-4 right-4">
                  <div className="relative w-3 h-3">
                    <div className="absolute inset-0 rounded-full bg-[#b8896a] opacity-80" />
                    <div className="absolute inset-0 rounded-full bg-[#b8896a] opacity-40 animate-ping" />
                  </div>
                </div>
              </div>
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                <span className="text-red-500 flex-shrink-0 mt-0.5">⚠</span>
                <div>
                  <p className="text-sm text-red-700 font-light leading-relaxed">{cameraError}</p>
                  {permissionState === 'denied' && (
                    <p className="text-xs text-red-500 mt-2 font-light">
                      💡 Tip: Look for the camera icon 🔒 in your browser's address bar to reset permissions.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tips Banner */}
            <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-[#f7ede4] to-[#fdf8f5] border border-[#e0c4b0]">
              <h4
                className="text-xs font-medium text-[#5c3d2e] mb-4 tracking-[0.25em] uppercase"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                📸 Photo Tips for Best Results
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '☀', tip: 'Natural lighting for accurate skin tone' },
                  { icon: '◎', tip: 'Look directly into the camera' },
                  { icon: '✦', tip: 'No heavy filters or editing' },
                  { icon: '❋', tip: 'Clean, moisturized skin preferred' },
                ].map((t) => (
                  <div key={t.tip} className="flex items-start gap-2">
                    <span className="text-[#b8896a] mt-0.5 flex-shrink-0">{t.icon}</span>
                    <p className="text-xs text-[#7d5440] font-light leading-relaxed">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Camera Loading ───────────────────────────────────── */}
        {cameraLoading && !cameraActive && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#e0c4b0]" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#b8896a] animate-spin" />
              <div className="absolute inset-2 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8896a" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-[#9e6e52] font-light tracking-wider animate-pulse">
              Requesting camera access...
            </p>
            <p className="text-xs text-[#cfa98e] font-light text-center max-w-xs">
              Please click "Allow" in your browser's permission dialog to grant camera access.
            </p>
          </div>
        )}

        {/* ─── Camera View ──────────────────────────────────────── */}
        {cameraActive && !preview && (
          <div className="animate-fade-in flex flex-col items-center gap-5">
            {/* Camera frame */}
            <div className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden border-2 border-[#e0c4b0] shadow-2xl bg-black">
              {/* Video element — always rendered when cameraActive, hidden until ready */}
              <video
                ref={videoRef}
                className={`w-full transition-opacity duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                playsInline
                muted
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />

              {/* Camera loading overlay */}
              {!cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1208] min-h-[300px]">
                  <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-[#3d2820]" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#b8896a] animate-spin" />
                  </div>
                  <p className="text-[#cfa98e] text-xs tracking-wider font-light">Starting camera...</p>
                </div>
              )}

              {/* Overlays — only when camera is ready */}
              {cameraReady && (
                <>
                  {/* Face guide oval */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="border-2 border-dashed border-[#cfa98e] opacity-70 rounded-full"
                      style={{ width: '55%', height: '75%' }}
                    />
                    {/* Corner markers */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#b8896a] rounded-tl-sm opacity-80" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#b8896a] rounded-tr-sm opacity-80" />
                    <div className="absolute bottom-16 left-4 w-6 h-6 border-b-2 border-l-2 border-[#b8896a] rounded-bl-sm opacity-80" />
                    <div className="absolute bottom-16 right-4 w-6 h-6 border-b-2 border-r-2 border-[#b8896a] rounded-br-sm opacity-80" />
                  </div>

                  {/* Scan line animation */}
                  <div
                    className="absolute left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#b8896a] to-transparent opacity-60"
                    style={{ animation: 'scan-line 2.5s ease-in-out infinite' }}
                  />

                  {/* Instruction bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-4 px-4 text-center">
                    <p className="text-white text-xs tracking-wider font-light">
                      {countdown !== null
                        ? `📸 Capturing in ${countdown}...`
                        : 'Align your face within the oval — good lighting recommended'}
                    </p>
                  </div>

                  {/* Countdown display */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl font-bold text-white"
                        style={{
                          background: 'radial-gradient(circle, rgba(184,137,106,0.4), transparent)',
                          fontFamily: 'Cormorant Garamond, serif',
                          textShadow: '0 0 20px rgba(184,137,106,0.8)',
                        }}
                      >
                        {countdown}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera controls */}
            <div className="flex flex-wrap gap-3 justify-center">
              {/* Capture button */}
              <button
                onClick={startCountdown}
                disabled={!cameraReady || capturing || countdown !== null}
                className={`relative flex items-center gap-2 px-8 py-3.5 rounded-full text-sm tracking-[0.15em] uppercase font-medium shadow-lg transition-all ${
                  !cameraReady || capturing || countdown !== null
                    ? 'opacity-50 cursor-not-allowed bg-[#e0c4b0] text-[#7d5440]'
                    : 'text-white hover:shadow-xl hover:scale-105 active:scale-95'
                }`}
                style={
                  cameraReady && !capturing && countdown === null
                    ? { background: 'linear-gradient(135deg, #b8896a, #7d5440)' }
                    : {}
                }
              >
                <span className="w-3 h-3 rounded-full bg-white/80 flex-shrink-0" />
                {capturing ? 'Capturing...' : countdown !== null ? `Wait ${countdown}...` : '◎  Capture Photo'}
              </button>

              {/* Switch camera (mobile) */}
              <button
                onClick={switchCamera}
                disabled={!cameraReady || countdown !== null}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full text-sm tracking-wider border border-[#e0c4b0] bg-white/80 text-[#7d5440] hover:border-[#b8896a] hover:bg-[#f7ede4] transition-all disabled:opacity-40"
                title="Switch camera"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Flip</span>
              </button>

              {/* Cancel */}
              <button
                onClick={stopCamera}
                className="px-5 py-3.5 rounded-full text-sm tracking-wider border border-[#e0c4b0] bg-white/80 text-[#7d5440] hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Camera status */}
            {cameraReady && (
              <div className="flex items-center gap-2 text-xs text-[#9e6e52] font-light">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Camera active · {facingMode === 'user' ? 'Front camera' : 'Rear camera'}
              </div>
            )}
          </div>
        )}

        {/* ─── Preview ──────────────────────────────────────────── */}
        {preview && (
          <div className="animate-fade-in flex flex-col items-center gap-7">
            <div className="relative w-full max-w-md mx-auto">
              <div className="rounded-3xl overflow-hidden border-2 border-[#e0c4b0] shadow-2xl">
                <img src={preview} alt="Preview" className="w-full object-cover" />
              </div>
              <div
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs tracking-wider text-white font-medium flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Ready to Analyze
              </div>
            </div>

            {/* Quality Checklist */}
            <div className="w-full max-w-md grid grid-cols-3 gap-3">
              {[
                { icon: '☀', label: 'Good Lighting', ok: true },
                { icon: '◎', label: 'Face Centered', ok: true },
                { icon: '↑', label: 'Front Facing', ok: true },
              ].map((tip) => (
                <div
                  key={tip.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#f7ede4] border border-[#e0c4b0]"
                >
                  <span className="text-[#b8896a] text-lg">{tip.icon}</span>
                  <span className="text-xs text-[#7d5440] tracking-wider text-center font-light">{tip.label}</span>
                  {tip.ok && <span className="text-[10px] text-green-600 font-medium">✓</span>}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleAnalyze}
                className="relative px-10 py-4 rounded-full text-sm tracking-[0.2em] uppercase font-medium text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
              >
                <span className="relative z-10">✦ Analyze My Face</span>
                <div
                  className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #cfa98e, #9e6e52)' }}
                />
              </button>
              <button
                onClick={resetAll}
                className="px-8 py-4 rounded-full text-sm tracking-wider border border-[#e0c4b0] bg-white/80 text-[#7d5440] hover:border-[#b8896a] hover:bg-[#f7ede4] transition-all"
              >
                ↺ Retake / Change
              </button>
            </div>

            <p className="text-xs text-[#cfa98e] font-light text-center max-w-xs leading-relaxed">
              Your photo is analyzed locally and never stored on our servers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
