import type { GeneratedTrack, MusicPreferences, SongLanguage } from '../types/music';

const VIBE_DESCRIPTORS: Record<string, string> = {
  'Full On Happy': 'euphoric, joyful, radiant, uplifting major-key energy',
  'Chill Scene': 'relaxed, laid-back, smooth atmospheric lounge groove',
  'Feeling Blue': 'melancholic, bittersweet, emotional late-night reflection',
  'Mystery Mode': 'enigmatic, suspenseful, hypnotic minor-key intrigue',
  'Ishq Vibes': 'romantic, passionate, heartfelt love anthem with lush melodies',
  'Party Sharty': 'high-octane dancefloor celebration, infectious party bounce',
};

const SOUND_DESCRIPTORS: Record<string, string> = {
  'Bollywood Tadaka': 'Modern Bollywood dance-pop fusion with vibrant Indian orchestration and catchy hooks',
  'Punjabi Pop': 'Contemporary Punjabi Pop with urban hip-hop production, groovy bassline, and infectious Punjabi folk cadence',
  'EDM Bangers': 'Festival EDM and Electro House with euphoric synth leads, driving four-on-the-floor kick, and massive drop',
  'Hip-Hop Swag': '808 Hip Hop and Trap Beat with booming sub-bass, crisp hi-hat rolls, and swaggering groove',
  'Jazz Vibes': 'Acid Jazz and Jazz Fusion with smooth Rhodes chords, walking bass, and expressive improvisation',
  'Rockstar Mode': 'Anthemic Arena Rock and Indie Rock with driving drums and soaring electric guitars',
  'Cinematic': 'Epic Orchestral Score with sweeping strings, brass swells, and wide cinematic staging',
  'Bhangra Beats': 'High-energy Bhangra folk-pop fusion with celebratory Punjabi rhythms and infectious folk melodies',
  'Instrumental': 'Purely instrumental arrangement with rich melodic storytelling and no vocals',
};

const INSTRUMENT_KEYWORDS: Record<string, string> = {
  'Piano Magic': 'Smooth Pianos and expressive grand piano melodies',
  'Guitar Swag': 'Warm Acoustic Guitar and rhythmic electric guitar riffs',
  'Violin Vibes': 'Soaring solo violin and lush Viola Ensemble strings',
  'Flute Flow': 'Expressive bansuri woodwind flute melodies',
  'Tabla Tadka': 'Intricate rhythmic Tabla percussion grooves',
  'Dhol Power': 'Thunderous Punjabi dhol percussion rhythms',
  'Drum Beats': 'Punchy Funk Drums and tight modern drum kit',
  'Sitar Soul': 'Resonant classical Sitar melodic phrases',
  'Synth Sounds': 'Spacey Synths, shimmering Synth Pads, and analog Moog Oscillations',
};

const FEELING_DESCRIPTORS: Record<string, string> = {
  'Dil Se': 'deeply heartfelt, sincere, emotional warmth straight from the heart',
  'Soulful': 'soulful, velvety, rich harmonic depth and intimate expression',
  'Royal Swag': 'regal, grand, majestic confidence with bold brass and royal flair',
  'Dark Mode': 'dark, moody, nocturnal cyberpunk atmosphere with deep bass textures',
  'Old-School Feels': 'nostalgic retro-vintage warmth with classic analog character',
  'Spiritual': 'transcendent, meditative, serene spiritual uplift',
  'Dreamy Scene': 'ethereal, floating, reverb-drenched dreamy soundscape',
  'Chardi Kala': 'unstoppable optimism, triumphant high-spirits, and fearless uplifting power',
};

const LANGUAGE_DIRECTIVES: Record<SongLanguage, string> = {
  Hindi:
    'Vocal & Lyric Language: Sing all vocals and lyrics in Hindi (authentic Hindi lyrics and pronunciation). Do NOT sing in English.',
  Punjabi:
    'Vocal & Lyric Language: Sing all vocals and lyrics in Punjabi (authentic Punjabi lyrics, folk-pop cadence, and pronunciation).',
  Hinglish:
    'Vocal & Lyric Language: Sing vocals in modern Hinglish (a catchy urban blend of predominantly Hindi lyrics mixed with English hook phrases).',
  English:
    'Vocal & Lyric Language: Sing all vocals and lyrics in English.',
  Tamil:
    'Vocal & Lyric Language: Sing all vocals and lyrics in Tamil (authentic Tamil lyrics and pronunciation).',
  Telugu:
    'Vocal & Lyric Language: Sing all vocals and lyrics in Telugu (authentic Telugu lyrics and pronunciation).',
};

/**
 * Resolves the effective vocal language:
 * - Checks if the user explicitly requested a language inside their custom prompt text
 *   (e.g., "in english", "english song", "punjabi", "hindi", "tamil", "telugu", "hinglish").
 * - Otherwise uses `prefs.language` (which defaults to 'Hindi').
 */
export function resolveEffectiveLanguage(prefs: MusicPreferences): SongLanguage {
  const customLower = prefs.customPrompt.toLowerCase();
  if (/\b(hinglish)\b/.test(customLower)) return 'Hinglish';
  if (/\b(english)\b/.test(customLower)) return 'English';
  if (/\b(punjabi)\b/.test(customLower)) return 'Punjabi';
  if (/\b(tamil)\b/.test(customLower)) return 'Tamil';
  if (/\b(telugu)\b/.test(customLower)) return 'Telugu';
  if (/\b(hindi)\b/.test(customLower)) return 'Hindi';
  return prefs.language || 'Hindi';
}

export function buildSubtitleTags(prefs: MusicPreferences): string {
  const tags = [
    prefs.sound.toUpperCase(),
    prefs.vibe.toUpperCase(),
    prefs.feeling.toUpperCase(),
  ];
  return tags.join(', ');
}

export function buildLyriaPrompt(prefs: MusicPreferences): string {
  const bpm = Math.round(72 + (prefs.beatSpeed / 100) * 72); // 72 to 144 BPM
  const tempoLabel =
    prefs.beatSpeed < 35
      ? `slow, relaxed tempo around ${bpm} BPM`
      : prefs.beatSpeed < 70
        ? `mid-tempo groove around ${bpm} BPM`
        : `fast, driving upbeat tempo around ${bpm} BPM`;

  const energyLabel =
    prefs.energyLevel < 35
      ? 'intimate, chill low-key dynamics with gentle transitions'
      : prefs.energyLevel < 70
        ? 'balanced, dynamic mid-to-high energy progression'
        : 'full-power, explosive concert-ready high energy with an anthemic climax';

  const selectedInstruments =
    prefs.instruments.length > 0
      ? prefs.instruments.map((i) => INSTRUMENT_KEYWORDS[i] || i).join(', ')
      : 'Smooth Pianos, Warm Acoustic Guitar, and modern percussion';

  // Interpret the 5 vertical Sound Balance sliders: [Bass, Warmth, Mids, Presence, Air]
  const [bass, warmth, mids, presence, air] = prefs.soundBalance;
  const mixNotes: string[] = [];
  if (bass >= 65) mixNotes.push('boomy sub-bass and deep low-end punch');
  if (warmth >= 65) mixNotes.push('warm analog low-mid body');
  if (mids >= 65) mixNotes.push('forward, expressive lead melodies');
  if (presence >= 65) mixNotes.push('crisp percussion transient attack');
  if (air >= 65) mixNotes.push('shimmering high-end air and wide stereo sparkle');
  const mixDescription =
    mixNotes.length > 0
      ? `Mix & tonal balance: ${mixNotes.join(', ')}.`
      : 'Mix & tonal balance: well-balanced studio master with clear stereo separation.';

  const isInstrumental = prefs.sound === 'Instrumental' || prefs.model === 'lyria-realtime-exp';
  const effectiveLanguage = resolveEffectiveLanguage(prefs);
  const languageDirective = isInstrumental
    ? 'Strictly instrumental track without vocals.'
    : `${LANGUAGE_DIRECTIVES[effectiveLanguage]} Include expressive ${effectiveLanguage} vocals, catchy melodic hooks, and polished modern production.`;

  const sectionsPrompt =
    prefs.model === 'lyria-3-clip-preview' || prefs.model === 'lyria-realtime-exp'
      ? `[0:00 - 0:06] Intro: Establish the ${prefs.sound} atmosphere with ${selectedInstruments}.
[0:06 - 0:22] Main Hook / Chorus: Full ${prefs.vibe.toLowerCase()} groove drops in at ${bpm} BPM with ${prefs.feeling.toLowerCase()} emotion${isInstrumental ? '' : ` and ${effectiveLanguage} vocals`}.
[0:22 - 0:30] Outro: Memorable melodic finish with resonant tail.`
      : `[Intro] Atmospheric opening introducing ${selectedInstruments}.
[Verse] Groove settles in at ${bpm} BPM with ${VIBE_DESCRIPTORS[prefs.vibe] || prefs.vibe}${isInstrumental ? '' : ` and expressive ${effectiveLanguage} vocals`}.
[Chorus] Anthemic, unforgettable ${isInstrumental ? 'melodic' : effectiveLanguage} centerpiece capturing ${FEELING_DESCRIPTORS[prefs.feeling] || prefs.feeling}.
[Bridge] Dynamic instrumental and vocal showcase highlighting ${selectedInstruments}.
[Outro] Grand, cohesive finale.`;

  const customAddition = prefs.customPrompt.trim()
    ? `\nAdditional creative direction from user: "${prefs.customPrompt.trim()}"`
    : '';

  return `${SOUND_DESCRIPTORS[prefs.sound] || prefs.sound} (${isInstrumental ? 'Instrumental' : `${effectiveLanguage} Song`}).
Mood & Vibe: ${VIBE_DESCRIPTORS[prefs.vibe] || prefs.vibe}.
Emotional Feeling: ${FEELING_DESCRIPTORS[prefs.feeling] || prefs.feeling}.
Featured Instruments: ${selectedInstruments}.
Tempo & Energy: ${tempoLabel}, with ${energyLabel}.
${mixDescription}
${languageDirective}${customAddition}

Structure:
${sectionsPrompt}`;
}

function base64ToUint8Array(base64Data: string): Uint8Array {
  const cleanBase64 = base64Data.replace(/^data:audio\/[a-zA-Z0-9+-]+;base64,/, '');
  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base64ToAudioBlob(
  base64Data: string,
  mimeType: string = 'audio/mp3'
): { blob: Blob; url: string } {
  const bytes = base64ToUint8Array(base64Data);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
  return { blob, url: URL.createObjectURL(blob) };
}

interface ServerGenerateMusicResponse {
  id?: string;
  audioBase64?: string;
  mimeType?: string;
  lyrics?: string;
  modelUsed?: string;
  error?: string;
}

/**
 * Calls the server-side `/api/generate-music` endpoint so the Google Gemini API key
 * remains strictly on the server (`.env`) and is never exposed in browser Network headers.
 */
export async function generateMusicWithLyria(
  prefs: MusicPreferences
): Promise<GeneratedTrack> {
  const prompt = buildLyriaPrompt(prefs);
  const bpm = Math.round(72 + (prefs.beatSpeed / 100) * 72);
  const weightedPrompt = `${SOUND_DESCRIPTORS[prefs.sound] || prefs.sound}, ${
    VIBE_DESCRIPTORS[prefs.vibe] || prefs.vibe
  }, ${FEELING_DESCRIPTORS[prefs.feeling] || prefs.feeling}, featuring ${prefs.instruments.join(', ')}${
    prefs.customPrompt.trim() ? `, ${prefs.customPrompt.trim()}` : ''
  }`;

  const response = await fetch('/api/generate-music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: prefs.model,
      bpm,
      weightedPrompt,
    }),
  });

  const data = (await response.json()) as ServerGenerateMusicResponse;

  if (!response.ok || !data.audioBase64) {
    throw new Error(
      data.error || `Music generation failed (${response.status}). Please verify GEMINI_API_KEY in .env.`
    );
  }

  const mimeType = data.mimeType || 'audio/mp3';
  const { blob: audioBlob, url: audioUrl } = base64ToAudioBlob(data.audioBase64, mimeType);

  return {
    id: data.id || `lyria-${Date.now()}`,
    title: 'YOUR MUSIC',
    subtitleTags: buildSubtitleTags(prefs),
    audioUrl,
    audioBlob,
    mimeType,
    lyrics: data.lyrics,
    promptUsed: prompt,
    modelUsed: data.modelUsed || prefs.model,
    createdAt: new Date().toISOString(),
    isDemoFallback: false,
  };
}

/**
 * Synthesizes a stereo 44.1kHz WAV preview track right in the browser using Web Audio OfflineAudioContext
 * so the user can test the full interactive player, EQ, waveform scrubber, and download flow even before adding an API key.
 */
export async function generateStudioPreviewFallback(
  prefs: MusicPreferences
): Promise<GeneratedTrack> {
  const durationSeconds = 16;
  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);

  const bpm = Math.round(78 + (prefs.beatSpeed / 100) * 64);
  const beatDur = 60 / bpm;
  const energy = 0.4 + (prefs.energyLevel / 100) * 0.6;

  // Choose scale based on vibe/feeling
  const isMinor =
    prefs.vibe === 'Mystery Mode' ||
    prefs.vibe === 'Feeling Blue' ||
    prefs.feeling === 'Dark Mode';
  const rootFreq = prefs.sound.includes('Punjabi') || prefs.sound.includes('Bhangra') ? 146.83 : 130.81; // D3 or C3
  const scaleRatios = isMinor
    ? [1, 9 / 8, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 9 / 5, 2]
    : [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2];

  // Master compressor
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.ratio.value = 4;
  compressor.connect(offlineCtx.destination);

  // 1. Lush Pad Chords
  const chordRoots = [0, 4, 5, 3];
  for (let bar = 0; bar < Math.ceil(durationSeconds / (beatDur * 4)); bar++) {
    const barStart = bar * beatDur * 4;
    if (barStart >= durationSeconds) break;
    const deg = chordRoots[bar % chordRoots.length];
    [0, 2, 4].forEach((offset, idx) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const panner = offlineCtx.createStereoPanner();
      osc.type = idx === 1 ? 'triangle' : 'sine';
      const ratio = scaleRatios[(deg + offset) % scaleRatios.length];
      osc.frequency.value = rootFreq * ratio * (idx === 2 ? 2 : 1);
      panner.pan.value = (idx - 1) * 0.45;

      const dur = Math.min(beatDur * 4, durationSeconds - barStart);
      gain.gain.setValueAtTime(0.001, barStart);
      gain.gain.linearRampToValueAtTime(0.065 * energy, barStart + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, barStart + dur);

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(compressor);
      osc.start(barStart);
      osc.stop(barStart + dur);
    });
  }

  // 2. Kick / Dhol / Tabla Percussion Pulse
  const totalBeats = Math.floor(durationSeconds / beatDur);
  for (let b = 0; b < totalBeats; b++) {
    const t = b * beatDur;
    // Kick / Dhol low hit
    const kickOsc = offlineCtx.createOscillator();
    const kickGain = offlineCtx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(135, t);
    kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    kickGain.gain.setValueAtTime(0.38 * energy, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    kickOsc.connect(kickGain);
    kickGain.connect(compressor);
    kickOsc.start(t);
    kickOsc.stop(t + 0.25);

    // Syncopated Bhangra/Pop off-beat bounce
    if (b % 2 === 1 || prefs.sound.includes('Bhangra') || prefs.sound.includes('Punjabi')) {
      const syncTime = t + beatDur * 0.5;
      if (syncTime + 0.15 < durationSeconds) {
        const dholOsc = offlineCtx.createOscillator();
        const dholGain = offlineCtx.createGain();
        dholOsc.type = 'triangle';
        dholOsc.frequency.setValueAtTime(220, syncTime);
        dholOsc.frequency.exponentialRampToValueAtTime(95, syncTime + 0.1);
        dholGain.gain.setValueAtTime(0.22 * energy, syncTime);
        dholGain.gain.exponentialRampToValueAtTime(0.001, syncTime + 0.12);
        dholOsc.connect(dholGain);
        dholGain.connect(compressor);
        dholOsc.start(syncTime);
        dholOsc.stop(syncTime + 0.13);
      }
    }
  }

  // 3. Lead Melody Arpeggio
  const melodyPattern = [0, 2, 4, 7, 4, 2, 5, 4];
  const sixteenth = beatDur / 2;
  const totalSteps = Math.floor(durationSeconds / sixteenth);
  for (let s = 0; s < totalSteps; s++) {
    const t = s * sixteenth;
    if (t + sixteenth >= durationSeconds) break;
    const noteIdx = melodyPattern[s % melodyPattern.length];
    const osc = offlineCtx.createOscillator();
    const filter = offlineCtx.createBiquadFilter();
    const gain = offlineCtx.createGain();

    osc.type = prefs.instruments.includes('Synth Sounds') ? 'sawtooth' : 'triangle';
    osc.frequency.value = rootFreq * 2 * scaleRatios[noteIdx % scaleRatios.length];

    filter.type = 'lowpass';
    filter.frequency.value = 1800 + (prefs.soundBalance[3] / 100) * 2400;

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.11 * energy, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + sixteenth * 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(compressor);
    osc.start(t);
    osc.stop(t + sixteenth);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const audioUrl = URL.createObjectURL(wavBlob);

  return {
    id: `demo-${Date.now()}`,
    title: 'YOUR MUSIC',
    subtitleTags: buildSubtitleTags(prefs),
    audioUrl,
    audioBlob: wavBlob,
    mimeType: 'audio/wav',
    lyrics: `[Intro - ${bpm} BPM]\n(${prefs.sound} • ${prefs.vibe})\n\n[Chorus]\nOwn the edge, feel the ${prefs.feeling} wave\n${prefs.instruments.join(' & ')} lighting up the stage!`,
    promptUsed: buildLyriaPrompt(prefs),
    modelUsed: `${prefs.model} (Studio Synth Preview)`,
    createdAt: new Date().toISOString(),
    isDemoFallback: true,
  };
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}
