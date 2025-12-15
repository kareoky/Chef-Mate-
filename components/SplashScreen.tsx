
import React, { useEffect, useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface SplashScreenProps {
  duration: number; // duration in ms
}

const SplashScreen: React.FC<SplashScreenProps> = ({ duration }) => {
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Advanced Cinematic Sound Generator (Web Audio API)
  const playCinematicSound = () => {
    try {
      // Create Context only on user interaction
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const now = ctx.currentTime;
      
      const masterGain = ctx.createGain();
      // BOOSTED VOLUME: Increased from 1.0 to 4.0 for louder impact
      masterGain.gain.value = 4.0; 
      masterGain.connect(ctx.destination);

      // --- 1. The "Ta" (The Impact) ---
      // A tight, snappy kick drum - deeper and punchier
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(120, now); 
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15); // Slower drop for more weight
      
      kickGain.gain.setValueAtTime(0, now);
      kickGain.gain.linearRampToValueAtTime(1, now + 0.01); 
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); 
      
      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.6);

      // --- 2. The "Dum" (The Bloom) ---
      // A rich, warm D Major 7th chord that swells up
      // D2, D3, F#3, A3, C#4
      const freqs = [73.42, 146.83, 185.00, 220.00, 277.18]; 
      
      freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Sawtooth gives that rich, synth texture
          osc.type = 'sawtooth'; 
          osc.frequency.value = f;
          // Slight detune for "chorus" effect (richness)
          osc.detune.value = (Math.random() * 6) - 3;

          // Lowpass filter sweep: Starts muffled, opens briefly, then closes
          // This creates the "Wah" or "Bloom" effect
          filter.type = 'lowpass';
          filter.Q.value = 0.5;
          filter.frequency.setValueAtTime(100, now);
          filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15); // The "Dum" opening
          filter.frequency.exponentialRampToValueAtTime(150, now + 4.0); // Slow fade out

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(masterGain);

          osc.start(now);
          
          // Amplitude Envelope
          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(0.3 / freqs.length, now + 0.05); // Attack slightly after kick
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5); // Long cinematic trail

          osc.stop(now + 5.0);
      });

    } catch (e) {
      console.warn("Audio generation failed", e);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    playCinematicSound();
  };

  useEffect(() => {
    if (!hasStarted) return;

    // 1. Progress Bar Animation (Only runs after start)
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [duration, hasStarted]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden font-sans"
    >
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className={`relative mb-10 transition-all duration-1000 ${hasStarted ? 'animate-float' : ''}`}>
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-500/20 transform hover:scale-105 transition-transform duration-700">
               <img 
                 src="https://i.ibb.co/YFr0kKPM/Logo.png" 
                 alt="Chef Mate" 
                 className="w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-lg"
               />
            </div>
            {/* Shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-[2rem] w-full h-full animate-shine pointer-events-none"></div>
        </div>

        {/* Text */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-lg text-center">
          Chef Mate
        </h1>
        <p className="text-slate-400 text-sm md:text-lg font-medium mb-12 tracking-wide opacity-80">
          مساعدك الذكي لكل وجبة
        </p>

        {/* Interaction Area: Button or Progress Bar */}
        {!hasStarted ? (
           <button 
             onClick={handleStart}
             className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border border-white/10"
           >
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
             </span>
             <span>ابدأ رحلة الطبخ</span>
             <Play size={20} className="fill-current" />
           </button>
        ) : (
          <div className="w-64 md:w-80 h-1.5 bg-slate-800 rounded-full overflow-hidden relative shadow-inner animate-fade-in">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 via-primary-500 to-yellow-300 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)]"
              style={{ 
                width: `${progress}%`,
                transition: 'width 0.1s linear'
              }}
            ></div>
          </div>
        )}
        
        {/* Version & Status */}
        <div className="mt-8 flex flex-col items-center gap-1 opacity-50">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            v1.20.2
          </span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-15deg); }
          50%, 100% { transform: translateX(150%) skewX(-15deg); }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
