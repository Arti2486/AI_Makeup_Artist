import { useState, useRef, useEffect } from 'react';
import { FaceAnalysis } from './AnalysisPage';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

interface AIAssistantProps {
  analysis?: FaceAnalysis | null;
}

const quickQuestions = [
  'What makeup suits my face shape?',
  'Best lip color for my skin tone?',
  'How do I do a smoky eye?',
  'What\'s the AI Confidence Mode?',
  'Tips for long-lasting makeup?',
  'How to contour my face?',
];

const aiResponses: Record<string, string> = {
  default: "I'm MAIA, your MakeMe AI Beauty Assistant! I'm here to answer all your makeup, skincare, and beauty questions. Ask me anything — from foundation shades to advanced contouring techniques! ✦",

  face: "Based on your facial analysis, I'll give you personalized advice! Your unique face architecture determines which makeup techniques work best for you. Different face shapes benefit from different contouring, blush placement, and highlighting techniques. Would you like specific tips for your face shape? ✦",

  lip: "For the most flattering lip color, consider your skin undertone! Warm undertones (yellow/peach) glow in terracotta, coral, and warm nudes. Cool undertones (pink/blue) look stunning in berry, mauve, and cool pinks. Neutral undertones can wear almost anything! Your analyzed skin profile can tell me exactly what suits you. 💄",

  smoky: "Creating the perfect smoky eye is all about blending! Here's the key: 1) Prime your lids thoroughly. 2) Start with a medium brown in the crease — don't jump to black immediately. 3) Deepen the outer corner and crease gradually. 4) Apply kohl liner on the waterline and smudge immediately. 5) BLEND, BLEND, BLEND — no harsh edges! 6) Keep lips nude to balance the drama. The secret is patient, circular blending. ✦",

  confidence: "AI Confidence Mode™ is MakeMe's exclusive feature that analyzes your specific facial proportions and features to create makeup recommendations that enhance YOUR unique beauty — not a generic ideal! It considers your golden ratio score, symmetry percentage, bone structure, and individual features to suggest looks that genuinely amplify what makes you beautiful. It's beauty intelligence, personalized for you. ◎",

  lasting: "For long-lasting makeup: 1) Always prep with a hydrating primer tailored to your skin type. 2) Set foundation with a translucent powder, especially on T-zone. 3) Use waterproof mascara and liner. 4) Layer lip liner under lipstick, then blot. 5) Finish with a quality setting spray (spritz in X-then-T motion). 6) Carry blotting papers for touch-ups — they remove shine without disturbing makeup! ✿",

  contour: "Contouring is about creating shadow and light strategically! For a beginner, use a matte powder 2-3 shades darker than your skin. The classic areas are: under cheekbones (suck in cheeks and draw along that hollow), temples, sides of nose, and jawline. Always blend with a warm tone — never leave sharp lines! Then highlight on cheekbone peaks, nose bridge, and cupid's bow. Remember: contouring enhances your natural structure — it doesn't create a different face. ◈",

  bridal: "Bridal makeup needs to be: 1) Photography-tested (look different on camera!). 2) Long-lasting — 12+ hours minimum. 3) Waterproof — tears are inevitable! My top tips: Do a trial run 2 weeks before. Always go waterproof mascara. Set everything with urban decay all nighter or similar. Use an HD foundation. Avoid overly trendy looks — timeless works best for photos that last forever. Your 'happiest' makeup is your best makeup. ❋",

  skincare: "Great makeup starts with great skin! The perfect base routine: 1) Gentle cleanser morning and night. 2) Toner or essence for hydration. 3) Vitamin C serum in morning, retinol at night. 4) Moisturizer suited to your skin type. 5) SPF 30+ every single morning — it's your best anti-aging investment! For makeup, let skincare absorb 5-10 minutes before primer. 🌿",

  eyeshadow: "Eyeshadow blending is a skill that transforms everything! Use the right brushes: a flat shader brush to pack color, a fluffy blending brush for diffusing. The rule of 3 shades: light on lid, medium in crease, dark in outer V. Always work dark colors in a windshield-wiper motion in the crease. Apply darker shades first in the crease, then transition colors. Blend out any harsh edges. Your eye shape from the analysis helps determine how high to blend! ✦",

  foundation: "Finding your perfect foundation match: 1) Always test on your jawline, not your wrist. 2) Check in natural daylight. 3) Consider your undertone — warm, cool, or neutral. 4) Match to your neck to avoid a face mask effect. 5) Consider coverage: sheer (skin tints), medium (most foundations), or full (HD/pro formulas). Your analyzed skin tone profile helps narrow it down significantly! ◎",

  highlight: "Highlighting is the art of light placement! Key areas: tops of cheekbones, bridge of nose, cupid's bow, brow bone, and inner corners of eyes. For a natural glow, use liquid or cream highlighters. For dramatic photo-ready glow, pressed powder highlights work beautifully. Apply with fingertips for the most seamless blend. Avoid highlighting textured or oily areas — it accentuates them. ✦",

  hello: "Hello, beautiful! 💫 I'm MAIA — MakeMe AI Assistant. I'm here to be your personal beauty guide. Whether you have questions about makeup techniques, product recommendations, skincare, or how to work with your unique features, I've got you! What can I help you with today?",

  thank: "You're so welcome! Remember, true beauty starts with confidence in your own unique features. MakeMe is here to help you celebrate and enhance what makes you beautifully you. Come back anytime! ✦ Is there anything else I can help with?",
};

function getAIResponse(message: string, analysis?: FaceAnalysis | null): string {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return aiResponses.hello;
  if (lower.includes('thank')) return aiResponses.thank;
  if (lower.includes('face') || lower.includes('shape') || lower.includes('structure')) {
    if (analysis) {
      return `Based on your analysis, you have a beautiful **${analysis.faceShape}** face shape with **${analysis.skinTone}** skin and **${analysis.skinUndertone}** undertones. Your face symmetry scored ${analysis.symmetryScore}% — which is wonderfully high! For your ${analysis.faceShape} face, I recommend focusing makeup to ${analysis.faceShape === 'Oval' ? 'maintain your naturally balanced proportions' : analysis.faceShape === 'Round' ? 'add length and definition' : analysis.faceShape === 'Square' ? 'soften angular jawline' : analysis.faceShape === 'Heart' ? 'balance a wider forehead with fuller lower face' : 'accentuate your natural structure'}. ✦`;
    }
    return aiResponses.face;
  }
  if (lower.includes('lip') || lower.includes('lipstick') || lower.includes('lip color')) {
    if (analysis) {
      return `For your **${analysis.skinTone}** skin with **${analysis.skinUndertone}** undertones, I recommend: ${analysis.skinUndertone.includes('Warm') ? 'terracotta, coral, peachy nudes, and warm browns' : analysis.skinUndertone.includes('Cool') ? 'berry, mauve, rose, and cool-toned nudes' : 'a wide range — rosy nudes, mauves, and terracottas all work!'}. Your ${analysis.lipShape} lip shape is perfect for ${analysis.lipShape.includes('Full') ? 'glossy, juicy finishes' : 'bold statement colors to define the lips'}. 💄`;
    }
    return aiResponses.lip;
  }
  if (lower.includes('smoky') || lower.includes('smoke')) return aiResponses.smoky;
  if (lower.includes('confidence') || lower.includes('mode') || lower.includes('ai mode')) return aiResponses.confidence;
  if (lower.includes('long') || lower.includes('lasting') || lower.includes('stay')) return aiResponses.lasting;
  if (lower.includes('contour') || lower.includes('sculpt')) {
    if (analysis) {
      return `For your **${analysis.faceShape}** face with **${analysis.cheekbones}** cheekbones: ${analysis.faceShape === 'Round' ? 'Apply contour along the sides of the face to add length. Focus on the temples, under cheekbones, and along the jawline.' : analysis.faceShape === 'Square' ? 'Soften the corners of your jaw and forehead temples. Use lighter hand on contour to avoid harsher angles.' : 'Your ' + analysis.faceShape + ' shape benefits from subtle cheekbone contouring to define your natural bone structure.'}. ◈`;
    }
    return aiResponses.contour;
  }
  if (lower.includes('bridal') || lower.includes('wedding')) return aiResponses.bridal;
  if (lower.includes('skin') || lower.includes('skincare') || lower.includes('routine')) return aiResponses.skincare;
  if (lower.includes('eye') || lower.includes('shadow') || lower.includes('eyeshadow')) {
    if (analysis) {
      return `For your **${analysis.eyeShape}** eyes: ${analysis.eyeShape === 'Hooded' ? 'Focus color above the crease to make it visible when eyes are open. Avoid shimmer on the mobile lid.' : analysis.eyeShape === 'Monolid' ? 'Build shadow on the lids directly. Graphic liner looks especially stunning.' : analysis.eyeShape === 'Almond' ? 'You can wear virtually any eye look! Your shape is the most versatile.' : analysis.eyeShape === 'Round' ? 'Elongate with outer V darkening and a subtle wing liner.' : 'Your ' + analysis.eyeShape + ' shape suits the technique beautifully with proper blending.'}. ✦`;
    }
    return aiResponses.eyeshadow;
  }
  if (lower.includes('foundation') || lower.includes('base') || lower.includes('coverage')) return aiResponses.foundation;
  if (lower.includes('highlight') || lower.includes('glow') || lower.includes('luminous')) return aiResponses.highlight;

  return `Great question! As your AI Beauty Assistant, I'd love to help with that. Based on your beauty profile${analysis ? ` (${analysis.faceShape} face, ${analysis.skinTone} skin, ${analysis.skinUndertone} undertones)` : ''}, I can give you the most personalized advice. Could you tell me a bit more about what specific aspect of makeup or beauty you're curious about? I'm here for all things beauty! ✦`;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AIAssistant({ analysis }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'ai',
      text: "Hello, gorgeous! 💫 I'm MAIA — MakeMe AI Beauty Assistant. I'm here to answer all your makeup, skincare, and beauty questions with expert knowledge personalized just for you. What can I help you with today? ✦",
      time: now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text: text.trim(),
      time: now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const aiResponse = getAIResponse(text, analysis);
      const aiMsg: Message = {
        id: generateId(),
        role: 'ai',
        text: aiResponse,
        time: now(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative animate-glow"
          style={{ background: 'linear-gradient(135deg, #b8896a, #5c3d2e)' }}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
            </svg>
          )}
          {!open && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#cfa98e] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          )}
        </button>
        {!open && (
          <div className="absolute bottom-16 right-0 bg-white/90 backdrop-blur-sm border border-[#e0c4b0] rounded-2xl rounded-br-sm px-3 py-2 shadow-xl whitespace-nowrap animate-fade-in-up">
            <p className="text-xs text-[#5c3d2e] font-light">Ask MAIA anything ✦</p>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[600px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#e0c4b0] animate-fade-in-up"
          style={{ background: '#fdf8f5' }}>

          {/* Chat Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e0c4b0]"
            style={{ background: 'linear-gradient(135deg, #1a1208, #3d2820)' }}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
                <span className="text-white text-lg">◎</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#1a1208]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white tracking-wider">MAIA</h4>
              <p className="text-[10px] text-[#cfa98e] tracking-wider">MakeMe AI Beauty Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-80">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  <div className={msg.role === 'ai' ? 'chat-bubble-ai px-4 py-3' : 'chat-bubble-user px-4 py-3'}>
                    <p className="text-xs leading-relaxed font-light">{msg.text}</p>
                  </div>
                  <p className={`text-[10px] mt-1 text-[#cfa98e] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{msg.time}</p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 py-2 border-t border-[#e0c4b0]">
            <p className="text-[10px] text-[#cfa98e] tracking-wider mb-2">Quick Questions</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full border border-[#e0c4b0] text-[#7d5440] bg-white/60 hover:border-[#b8896a] hover:text-[#b8896a] transition-all whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#e0c4b0] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MAIA anything..."
              className="flex-1 bg-[#f7ede4] border border-[#e0c4b0] rounded-xl px-4 py-2.5 text-xs text-[#3d2820] placeholder-[#cfa98e] outline-none focus:border-[#b8896a] transition-colors font-light"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 2L11 13" strokeLinecap="round" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
