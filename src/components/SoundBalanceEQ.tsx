import React, { useRef, useState } from 'react';
import { SOUND_BALANCE_LABELS } from '../types/music';

interface SoundBalanceEQProps {
  values: [number, number, number, number, number];
  onChange: (nextValues: [number, number, number, number, number]) => void;
}

const SHORT_BAND_LABELS = ['Bass', 'Warm', 'Mids', 'High', 'Air'] as const;

const EQ_PRESETS: { name: string; values: [number, number, number, number, number] }[] = [
  { name: 'Studio Mix', values: [58, 76, 62, 54, 82] },
  { name: 'Bass Boost', values: [90, 78, 52, 60, 72] },
  { name: 'Vocal Glow', values: [48, 62, 85, 82, 76] },
  { name: 'Flat', values: [60, 60, 60, 60, 60] },
];

export const SoundBalanceEQ: React.FC<SoundBalanceEQProps> = ({ values, onChange }) => {
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeBand, setActiveBand] = useState<number | null>(null);

  const updateBarFromClientY = (index: number, clientY: number) => {
    const el = trackRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relY = rect.bottom - clientY;
    const pct = Math.max(10, Math.min(95, Math.round((relY / rect.height) * 100)));
    const next = [...values] as [number, number, number, number, number];
    next[index] = pct;
    onChange(next);
  };

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveBand(index);
    updateBarFromClientY(index, e.clientY);
  };

  const handlePointerMove = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateBarFromClientY(index, e.clientY);
  };

  const handlePointerUp = () => {
    setActiveBand(null);
  };

  const matchedPreset = EQ_PRESETS.find((preset) =>
    preset.values.every((v, i) => Math.abs(v - values[i]) <= 3)
  );

  const cyclePreset = () => {
    const currentIdx = EQ_PRESETS.findIndex((p) => p.name === matchedPreset?.name);
    const nextPreset = EQ_PRESETS[(currentIdx + 1) % EQ_PRESETS.length];
    onChange([...nextPreset.values]);
  };

  return (
    <div className="rupay-option-card rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Top Header Row — aligns with Beat Speed & Energy Level headers */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#8ec5ff]">Sound Balance</span>
        {activeBand !== null ? (
          <span className="text-[11px] text-white/90 font-mono">
            {SOUND_BALANCE_LABELS[activeBand]} {values[activeBand]}%
          </span>
        ) : (
          <button
            type="button"
            onClick={cyclePreset}
            title="Click to cycle EQ presets"
            className="text-[10px] font-mono text-[#9bcaff] hover:text-white bg-[#102158]/80 hover:bg-[#19317d] border border-[#4f84e8]/45 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
          >
            {matchedPreset ? matchedPreset.name : 'Custom EQ'}
          </button>
        )}
      </div>

      {/* Middle 5-Band Equalizer Faders */}
      <div className="relative flex items-center justify-between gap-1.5 flex-1 my-1 px-1.5 py-2">
        {/* Subtle studio reference lines */}
        <div className="pointer-events-none absolute inset-x-1.5 inset-y-2 flex flex-col justify-between opacity-25">
          <div className="border-b border-dashed border-[#8ec5ff]/50" />
          <div className="border-b border-dashed border-[#8ec5ff]/70" />
          <div className="border-b border-dashed border-[#8ec5ff]/50" />
        </div>

        {values.map((val, idx) => {
          const isCurrent = activeBand === idx;
          return (
            <div
              key={SOUND_BALANCE_LABELS[idx]}
              onPointerDown={(e) => handlePointerDown(idx, e)}
              onPointerMove={(e) => handlePointerMove(idx, e)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative z-10 flex flex-col items-center justify-center flex-1 h-full min-h-[82px] cursor-ns-resize touch-none select-none group py-1"
              title={`${SOUND_BALANCE_LABELS[idx]}: ${val}%`}
            >
              {/* Vertical Track matching horizontal .rupay-slider look */}
              <div
                ref={(el) => {
                  trackRefs.current[idx] = el;
                }}
                className="relative w-[6px] h-full min-h-[72px] rounded-full bg-white/18 flex flex-col justify-end"
              >
                {/* Active Gradient Fill */}
                <div
                  className="w-full rounded-full transition-[height] duration-75"
                  style={{
                    height: `${val}%`,
                    background: 'linear-gradient(0deg, #8ec5ff 0%, #ffffff 100%)',
                    boxShadow: isCurrent
                      ? '0 0 12px rgba(142, 197, 255, 0.95)'
                      : '0 0 8px rgba(142, 197, 255, 0.55)',
                  }}
                />

                {/* Unclipped Glowing Circular Thumb Knob (matches horizontal slider thumb) */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#8ec5ff] shadow-[0_0_10px_rgba(142,197,255,0.9)] pointer-events-none transition-transform duration-150 ${
                    isCurrent ? 'scale-125' : 'group-hover:scale-115'
                  }`}
                  style={{
                    bottom: `calc(${val}% - 7px)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Band Labels Row — aligns with Slow/Fast & Chill/Full Power */}
      <div className="flex items-center justify-between gap-1 px-0.5 mt-1">
        {SHORT_BAND_LABELS.map((label, idx) => (
          <span
            key={label}
            className={`flex-1 text-center text-[10px] transition-colors ${
              activeBand === idx ? 'text-white font-semibold' : 'text-white/75'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
