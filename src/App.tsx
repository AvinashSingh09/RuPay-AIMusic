import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Globe,
  Heart,
  Loader2,
  Music,
  Piano,
  RefreshCw,
  Settings,
  Smile,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RuPayLogo } from './components/RuPayLogo';
import { SoundBalanceEQ } from './components/SoundBalanceEQ';
import { WaveformPlayer } from './components/WaveformPlayer';
import {
  isCloudinaryConfigured,
  uploadAudioToCloudinary,
} from './services/cloudinaryService';
import {
  buildSubtitleTags,
  generateMusicWithLyria,
  generateStudioPreviewFallback,
  resolveEffectiveLanguage,
} from './services/lyriaService';
import {
  FEELING_BOTTOM_OPTIONS,
  FEELING_GRID_OPTIONS,
  INSTRUMENT_OPTIONS,
  LANGUAGE_OPTIONS,
  SOUND_OPTIONS,
  VIBE_OPTIONS,
  type GeneratedTrack,
  type MusicPreferences,
  type ScreenStep,
} from './types/music';

const LOADING_STAGES = [
  'Tuning instruments & studio acoustics...',
  'Locking in your beat speed & rhythm...',
  'Composing vocals & heartfelt lyrics...',
  'Balancing bass, warmth & high-end air...',
  'Mastering your full-length Aura Anthem...',
] as const;

const EQ_BAR_DELAYS = [
  '0ms',
  '140ms',
  '280ms',
  '90ms',
  '220ms',
  '360ms',
  '120ms',
  '260ms',
  '60ms',
  '190ms',
  '310ms',
  '150ms',
] as const;

export function App() {
  const [prefs, setPrefs] = useState<MusicPreferences>({
    vibe: 'Full On Happy',
    sound: 'Bollywood Tadaka',
    instruments: ['Guitar Swag'],
    feeling: 'Chardi Kala',
    language: 'Hindi',
    beatSpeed: 64,
    energyLevel: 72,
    soundBalance: [58, 76, 60, 52, 82],
    customPrompt: '',
    model: 'lyria-3.5',
  });

  const [activeStep, setActiveStep] = useState<ScreenStep>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isUploadingCloud, setIsUploadingCloud] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null);

  useEffect(() => {
    if (!isGenerating) return;

    const stageTimer = window.setInterval(() => {
      setLoadingStageIdx((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 4500);

    const secTimer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(secTimer);
    };
  }, [isGenerating]);

  const toggleInstrument = (inst: string) => {
    setPrefs((prev) => {
      const exists = prev.instruments.includes(inst);
      if (exists) {
        if (prev.instruments.length === 1) return prev;
        return {
          ...prev,
          instruments: prev.instruments.filter((item) => item !== inst),
        };
      }
      return {
        ...prev,
        instruments: [...prev.instruments, inst],
      };
    });
  };

  const uploadTrackToCloudinary = async (track: GeneratedTrack) => {
    if (!track.audioBlob) return;
    if (!isCloudinaryConfigured()) {
      setGeneratedTrack((prev) =>
        prev
          ? {
              ...prev,
              cloudinaryUploadError:
                'Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env to enable QR audio links.',
            }
          : prev
      );
      return;
    }

    setIsUploadingCloud(true);
    try {
      const uploaded = await uploadAudioToCloudinary(
        track.audioBlob,
        track.mimeType,
        `rupay-${prefs.sound}-${prefs.vibe}`
      );
      setGeneratedTrack((prev) =>
        prev
          ? {
              ...prev,
              cloudinaryUrl: uploaded.secureUrl,
              cloudinaryDownloadUrl: uploaded.downloadUrl,
              cloudinaryUploadError: undefined,
            }
          : prev
      );
    } catch (cloudErr: unknown) {
      const msg =
        cloudErr instanceof Error
          ? cloudErr.message
          : 'Failed to upload audio to Cloudinary.';
      setGeneratedTrack((prev) =>
        prev
          ? {
              ...prev,
              cloudinaryUploadError: msg,
            }
          : prev
      );
    } finally {
      setIsUploadingCloud(false);
    }
  };

  const handleGenerate = async () => {
    setLoadingStageIdx(0);
    setElapsedSeconds(0);
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const track = await generateMusicWithLyria(prefs);
      setGeneratedTrack(track);
      setActiveStep(4);
      void uploadTrackToCloudinary(track);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to generate music with Google Lyria. Please verify GEMINI_API_KEY in .env.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePreviewFallback = async () => {
    setLoadingStageIdx(0);
    setElapsedSeconds(0);
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const demo = await generateStudioPreviewFallback(prefs);
      setGeneratedTrack(demo);
      setActiveStep(4);
      void uploadTrackToCloudinary(demo);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTrack = () => {
    if (!generatedTrack) return;
    if (generatedTrack.cloudinaryDownloadUrl) {
      window.open(generatedTrack.cloudinaryDownloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const ext = generatedTrack.mimeType.includes('wav') ? 'wav' : 'mp3';
    const link = document.createElement('a');
    link.href = generatedTrack.audioUrl;
    link.download = `RuPay-Aura-Anthem-${prefs.sound.replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Full-Screen Loading View While Song Is Generating ---
  const renderGeneratingScreen = () => {
    const effectiveLanguage = resolveEffectiveLanguage(prefs);
    const isInstrumental = prefs.sound === 'Instrumental';

    return (
      <div className="w-full max-w-xl mx-auto min-h-screen px-6 py-10 flex flex-col items-center justify-between text-center">
        {/* Top Brand + Title */}
        <div className="w-full flex flex-col items-center mt-2">
          <RuPayLogo size="lg" />

          <h1 className="font-display text-3xl sm:text-4xl leading-[1.12] font-semibold tracking-[0.08em] text-[#7ebeff] uppercase mt-6">
            MUSIC
            <br />
            GENERATOR
          </h1>
        </div>

        {/* Center Animated Studio Visualizer */}
        <div className="w-full max-w-md my-auto py-8 flex flex-col items-center">
          {/* Glowing Equalizer Orb */}
          <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full bg-[#1e6bff]/25 blur-2xl animate-pulse" />
            <div className="absolute inset-2 rounded-full border border-[#8ec5ff]/35 animate-ping [animation-duration:2.6s]" />
            <div className="relative w-32 h-32 rounded-full bg-[#060d30]/90 border border-[#6eb2ff]/60 shadow-[0_0_32px_rgba(0,136,255,0.45)] flex items-end justify-center gap-1.5 px-5 py-8">
              {EQ_BAR_DELAYS.map((delay, idx) => (
                <div
                  key={idx}
                  className="rupay-eq-bar w-1.5 h-16 rounded-full"
                  style={{
                    animationDelay: delay,
                    background:
                      'linear-gradient(180deg, #ffffff 0%, #9bcaff 45%, #2b7fff 100%)',
                    boxShadow: '0 0 8px rgba(142, 197, 255, 0.8)',
                  }}
                />
              ))}
            </div>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-[0.08em] text-[#8ec5ff] uppercase">
            CRAFTING YOUR AURA ANTHEM
          </h2>

          <p className="text-xs sm:text-sm font-medium text-white/90 mt-2.5 min-h-[22px] transition-all">
            {LOADING_STAGES[loadingStageIdx]}
          </p>

          {/* Selected Vibe / Sound / Language Summary Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#0b1747]/90 border border-[#4f84e8]/50 text-[#bbe0ff]">
              {prefs.sound}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#0b1747]/90 border border-[#4f84e8]/50 text-[#bbe0ff]">
              {prefs.vibe}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#0b1747]/90 border border-[#4f84e8]/50 text-[#bbe0ff]">
              {isInstrumental ? 'Instrumental' : `${effectiveLanguage} Vocals`}
            </span>
          </div>
        </div>

        {/* Bottom Progress Note */}
        <div className="w-full max-w-xs pb-4 flex flex-col items-center gap-2">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(95, 12 + elapsedSeconds * 3)}%`,
                background: 'linear-gradient(90deg, #79b8ff 0%, #ffffff 50%, #79b8ff 100%)',
                boxShadow: '0 0 12px rgba(142, 197, 255, 0.9)',
              }}
            />
          </div>
          <span className="text-[11px] text-[#9bcaff]/80 tracking-wider uppercase font-mono">
            Composing full studio track • {elapsedSeconds}s
          </span>
        </div>
      </div>
    );
  };

  // --- Step 1: Welcome / Splash ---
  const renderStep1 = () => (
    <div className="w-full max-w-xl mx-auto min-h-screen px-6 py-12 flex flex-col items-center justify-between text-center">
      {/* Top Brand + Title */}
      <div className="w-full flex flex-col items-center mt-4 sm:mt-8">
        <RuPayLogo size="lg" />

        <h1 className="font-display text-4xl sm:text-5xl leading-[1.12] font-semibold tracking-[0.08em] text-[#7ebeff] uppercase mt-8">
          MUSIC
          <br />
          GENERATOR
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-white/90 uppercase mt-3">
          LET&apos;S FIND YOUR AURA ANTHEM.
        </p>
      </div>

      {/* Center Callout */}
      <div className="my-auto py-10">
        <h2 className="font-display text-3xl sm:text-4xl leading-[1.22] font-semibold tracking-[0.06em] text-[#7ebeff] uppercase">
          TURN YOUR VIBE
          <br />
          INTO A BEAT!
        </h2>
      </div>

      {/* Bottom CTA */}
      <div className="w-full pb-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="rupay-cta-btn w-full max-w-[300px] py-4 px-8 rounded-full font-bold text-sm sm:text-base tracking-[0.08em] uppercase flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <span>START GENERATING</span>
          <ArrowRight className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );

  // --- Step 2: Vibe, Sound & Instruments ---
  const renderStep2 = () => (
    <div className="w-full max-w-xl mx-auto min-h-screen px-5 sm:px-8 py-8 flex flex-col justify-between">
      {/* Section 1: What's Your Vibe Today? */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3.5">
          <Smile className="w-4 h-4 text-[#8ec5ff] shrink-0" />
          <h2 className="font-display text-sm sm:text-base font-semibold tracking-[0.08em] text-[#8ec5ff] uppercase text-center">
            WHAT&apos;S YOUR VIBE TODAY?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {VIBE_OPTIONS.map((vibe) => {
            const isSelected = prefs.vibe === vibe;
            return (
              <button
                key={vibe}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, vibe }))}
                className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-medium tracking-wide text-center cursor-pointer ${
                  isSelected
                    ? 'rupay-option-card-active text-white font-semibold'
                    : 'rupay-option-card text-[#89b9f5]'
                }`}
              >
                {vibe}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rupay-divider my-5" />

      {/* Section 2: Pick Your Sound, Paaji */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3.5">
          <Music className="w-4 h-4 text-[#8ec5ff] shrink-0" />
          <h2 className="font-display text-sm sm:text-base font-semibold tracking-[0.08em] text-[#8ec5ff] uppercase text-center">
            PICK YOUR SOUND, PAAJI
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {SOUND_OPTIONS.map((sound) => {
            const isSelected = prefs.sound === sound;
            return (
              <button
                key={sound}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, sound }))}
                className={`min-h-[48px] py-2.5 px-2.5 rounded-xl text-xs sm:text-[13px] leading-tight font-medium text-center flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'rupay-option-card-active text-white font-semibold'
                    : 'rupay-option-card text-[#89b9f5]'
                }`}
              >
                {sound}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rupay-divider my-5" />

      {/* Section 3: Choose the Sounds That Bring Your Beat to Life */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3.5">
          <Piano className="w-4 h-4 text-[#8ec5ff] shrink-0" />
          <h2 className="font-display text-sm sm:text-base leading-snug font-semibold tracking-[0.06em] text-[#8ec5ff] uppercase text-center">
            CHOOSE THE SOUNDS
            <br />
            THAT BRING YOUR BEAT TO LIFE.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {INSTRUMENT_OPTIONS.map((inst) => {
            const isSelected = prefs.instruments.includes(inst);
            return (
              <button
                key={inst}
                type="button"
                onClick={() => toggleInstrument(inst)}
                className={`min-h-[48px] py-2.5 px-2.5 rounded-xl text-xs sm:text-[13px] leading-tight font-medium text-center flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'rupay-option-card-active text-white font-semibold'
                    : 'rupay-option-card text-[#89b9f5]'
                }`}
              >
                {inst}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className="py-3 px-5 rounded-full rupay-option-card text-[#9bcaff] hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className="rupay-cta-btn flex-1 max-w-[230px] py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );

  // --- Step 3: Feeling, Language, Fine-Tuning & Custom Vibe ---
  const renderStep3 = () => (
    <div className="w-full max-w-xl mx-auto min-h-screen px-5 sm:px-8 py-8 flex flex-col justify-between">
      {/* Section 1: What's the Feeling Behind Your Music? */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3.5">
          <Heart className="w-4 h-4 text-[#8ec5ff] shrink-0" />
          <h2 className="font-display text-sm sm:text-base font-semibold tracking-[0.06em] text-[#8ec5ff] uppercase text-center">
            WHAT&apos;S THE FEELING BEHIND YOUR MUSIC?
          </h2>
        </div>

        {/* First 6 options in 3x2 grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {FEELING_GRID_OPTIONS.map((feeling) => {
            const isSelected = prefs.feeling === feeling;
            return (
              <button
                key={feeling}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, feeling }))}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs sm:text-[13px] leading-tight font-medium text-center flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'rupay-option-card-active text-white font-semibold'
                    : 'rupay-option-card text-[#89b9f5]'
                }`}
              >
                {feeling}
              </button>
            );
          })}
        </div>

        {/* Bottom 2 centered options (Dreamy Scene | Chardi Kala) */}
        <div className="flex justify-center gap-2.5 mt-2.5">
          {FEELING_BOTTOM_OPTIONS.map((feeling) => {
            const isSelected = prefs.feeling === feeling;
            return (
              <button
                key={feeling}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, feeling }))}
                className={`w-[32%] min-h-[44px] py-2 px-2.5 rounded-xl text-xs sm:text-[13px] leading-tight font-medium text-center flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'rupay-option-card-active text-white font-semibold'
                    : 'rupay-option-card text-[#89b9f5]'
                }`}
              >
                {feeling}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rupay-divider my-4" />

      {/* Section 2: Choose Song Language (Default: Hindi) */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-[#8ec5ff] shrink-0" />
          <h2 className="font-display text-sm sm:text-base font-semibold tracking-[0.06em] text-[#8ec5ff] uppercase text-center">
            PICK YOUR SONG LANGUAGE
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = prefs.language === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, language: lang }))}
                className={`min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-medium text-center flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'rupay-option-card-active text-white font-semibold'
                    : 'rupay-option-card text-[#89b9f5]'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rupay-divider my-4" />

      {/* Section 3: Fine-Tune Your Track, Just the Way You Like It */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-[#8ec5ff] shrink-0" />
          <h2 className="font-display text-sm sm:text-base leading-snug font-semibold tracking-[0.06em] text-[#8ec5ff] uppercase text-center">
            FINE-TUNE YOUR TRACK,
            <br />
            JUST THE WAY YOU LIKE IT.
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-3 items-stretch">
          {/* Left Column: Beat Speed + Energy Level */}
          <div className="col-span-6 flex flex-col gap-3 justify-between">
            {/* Beat Speed Card */}
            <div className="rupay-option-card rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#8ec5ff]">Beat Speed</span>
                <span className="text-[11px] text-white/60 font-mono">
                  {Math.round(72 + (prefs.beatSpeed / 100) * 72)} BPM
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={prefs.beatSpeed}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, beatSpeed: Number(e.target.value) }))
                }
                className="rupay-slider"
                style={{
                  background: `linear-gradient(90deg, #ffffff 0%, #8ec5ff ${prefs.beatSpeed}%, rgba(255,255,255,0.18) ${prefs.beatSpeed}%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-white/75 mt-2">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Energy Level Card */}
            <div className="rupay-option-card rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#8ec5ff]">Energy Level</span>
                <span className="text-[11px] text-white/70 font-mono">{prefs.energyLevel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={prefs.energyLevel}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, energyLevel: Number(e.target.value) }))
                }
                className="rupay-slider"
                style={{
                  background: `linear-gradient(90deg, #ffffff 0%, #8ec5ff ${prefs.energyLevel}%, rgba(255,255,255,0.18) ${prefs.energyLevel}%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-white/75 mt-2">
                <span>Chill</span>
                <span>Full Power</span>
              </div>
            </div>
          </div>

          {/* Right Column: 5-Bar Vertical Sound Balance */}
          <div className="col-span-6">
            <SoundBalanceEQ
              values={prefs.soundBalance}
              onChange={(soundBalance) => setPrefs((p) => ({ ...p, soundBalance }))}
            />
          </div>
        </div>
      </div>

      <div className="rupay-divider my-4" />

      {/* Section 4: Got a Vibe in Mind? Tell Us! */}
      <div>
        <h2 className="font-display text-sm sm:text-base font-semibold tracking-[0.08em] text-[#8ec5ff] uppercase text-center mb-2.5">
          GOT A VIBE IN MIND? TELL US!
        </h2>
        <div className="rupay-option-card rounded-xl p-3.5">
          <textarea
            rows={2}
            value={prefs.customPrompt}
            onChange={(e) => setPrefs((p) => ({ ...p, customPrompt: e.target.value }))}
            placeholder="e.g. A high-energy beat with heavy dhol, killer bass and concert vibes (mention English, Hindi, or Punjabi if you want a specific language)..."
            className="w-full bg-transparent text-xs sm:text-sm leading-relaxed text-white placeholder-[#7daef0]/70 resize-none outline-none"
          />
        </div>
      </div>

      {/* Error Banner if API call failed */}
      {errorMessage && (
        <div className="mt-4 rounded-xl bg-red-950/75 border border-red-400/50 px-4 py-3 text-xs text-red-200 flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={handleGeneratePreviewFallback}
            className="shrink-0 underline text-[#9bcaff] font-semibold cursor-pointer"
          >
            Use Preview
          </button>
        </div>
      )}

      {/* Bottom Generate CTA */}
      <div className="pt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          disabled={isGenerating}
          onClick={() => setActiveStep(2)}
          className="py-3 px-5 rounded-full rupay-option-card text-[#9bcaff] hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="rupay-cta-btn flex-1 max-w-[230px] py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <span>GENERATE</span>
          <ArrowRight className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );

  // --- Step 4: Your Aura Anthem (Player + Working Cloudinary QR Code) ---
  const renderStep4 = () => {
    const subtitleTags = generatedTrack?.subtitleTags || buildSubtitleTags(prefs);
    const audioUrl = generatedTrack?.audioUrl || '';
    const qrTargetUrl =
      generatedTrack?.cloudinaryDownloadUrl ||
      generatedTrack?.cloudinaryUrl ||
      '';

    return (
      <div className="w-full max-w-xl mx-auto min-h-screen px-6 py-10 flex flex-col items-center justify-between text-center">
        {/* Top Brand + Title */}
        <div className="w-full flex flex-col items-center mt-2">
          <RuPayLogo size="lg" />

          <h1 className="font-display text-3xl sm:text-4xl leading-[1.12] font-semibold tracking-[0.08em] text-[#7ebeff] uppercase mt-6">
            MUSIC
            <br />
            GENERATOR
          </h1>
        </div>

        {/* Middle Aura Anthem Heading + Player Card */}
        <div className="w-full max-w-md flex flex-col items-center my-auto py-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.08em] text-[#8ec5ff] uppercase">
            YOUR AURA ANTHEM
          </h2>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/90 uppercase mt-1.5 mb-6">
            YOUR VIBE. YOUR BEAT. YOUR CREATION.
          </p>

          <WaveformPlayer
            audioUrl={audioUrl}
            title={generatedTrack?.title || 'YOUR MUSIC'}
            subtitleTags={subtitleTags}
          />
        </div>

        {/* Bottom QR Code + Cloudinary Audio Download Card */}
        <div className="w-full flex flex-col items-center gap-3 pb-4">
          <div
            onClick={handleDownloadTrack}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleDownloadTrack();
            }}
            className="w-full max-w-[290px] rounded-2xl bg-[#070b28]/92 border border-[#2d4c9c]/60 hover:border-[#8ec5ff] p-4 flex items-center justify-between gap-4 cursor-pointer transition-all group shadow-[0_10px_28px_rgba(1,5,24,0.6)]"
            title={
              qrTargetUrl
                ? 'Scan QR code on your phone or click to download your anthem from Cloudinary'
                : 'Click to download your anthem'
            }
          >
            {/* QR Code Box */}
            <div className="relative p-2 bg-white rounded-lg shrink-0 w-[76px] h-[76px] flex items-center justify-center">
              {isUploadingCloud ? (
                <div className="flex flex-col items-center justify-center text-[#050b29]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#004be0]" />
                </div>
              ) : qrTargetUrl ? (
                <QRCodeSVG
                  value={qrTargetUrl}
                  size={60}
                  bgColor="#ffffff"
                  fgColor="#050b29"
                  level="M"
                />
              ) : (
                <QRCodeSVG
                  value={window.location.href}
                  size={60}
                  bgColor="#ffffff"
                  fgColor="#050b29"
                  level="M"
                />
              )}
            </div>

            {/* Right Download Icon & Text */}
            <div className="flex-1 flex flex-col items-center justify-center text-center pr-1">
              <Download className="w-5 h-5 text-[#8ec5ff] group-hover:translate-y-0.5 transition-transform mb-1.5" />
              <span className="text-[10px] sm:text-[11px] leading-[1.3] font-bold tracking-[0.1em] text-white uppercase">
                SCAN TO DOWNLOAD
                <br />
                YOUR ANTHEM
              </span>
              {isUploadingCloud && (
                <span className="text-[9.5px] text-[#8ec5ff] mt-1">
                  Preparing QR link...
                </span>
              )}
              {!isUploadingCloud && qrTargetUrl && (
                <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-300 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to scan
                </span>
              )}
            </div>
          </div>

          {!isUploadingCloud && generatedTrack?.cloudinaryUploadError && (
            <div className="max-w-sm text-[11px] text-amber-200/90 bg-amber-950/50 border border-amber-400/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span>{generatedTrack.cloudinaryUploadError}</span>
              {isCloudinaryConfigured() && generatedTrack.audioBlob && (
                <button
                  type="button"
                  onClick={() => void uploadTrackToCloudinary(generatedTrack)}
                  className="underline text-white font-semibold shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#bbe0ff] hover:text-white transition-colors mt-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Create Another Anthem</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full rupay-screen-bg text-white relative overflow-x-hidden">
      {/* Subtle Ambient Top & Bottom Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[320px] rounded-full bg-[#2468ff]/20 blur-[120px]" />
        <div className="absolute bottom-[-160px] right-1/4 w-[460px] h-[460px] rounded-full bg-[#008cff]/20 blur-[130px]" />
      </div>

      {/* Full-Screen Step-by-Step Content */}
      <main className="relative z-10 w-full min-h-screen">
        {isGenerating ? (
          renderGeneratingScreen()
        ) : (
          <>
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
            {activeStep === 3 && renderStep3()}
            {activeStep === 4 && renderStep4()}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
