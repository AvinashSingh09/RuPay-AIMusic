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

/**
 * Builds structured, meaningful, rhyming lyrics (`[Verse 1]`, `[Chorus]`, `[Verse 2]`, `[Bridge]`, `[Chorus]`)
 * in the selected language and mood so Lyria 3.5 always sings real, rhyming song verses and hooks.
 */
export function buildCuratedRhymingLyrics(prefs: MusicPreferences): string {
  const lang = resolveEffectiveLanguage(prefs);
  const isRomantic = prefs.vibe === 'Ishq Vibes' || prefs.feeling === 'Dil Se';
  const isMelancholic = prefs.vibe === 'Feeling Blue' || prefs.feeling === 'Old-School Feels';
  const isChill = prefs.vibe === 'Chill Scene' || prefs.feeling === 'Dreamy Scene' || prefs.feeling === 'Soulful';

  if (lang === 'Punjabi') {
    if (isRomantic) {
      return `[Verse 1]
Tere naal judiyan ne saahan diyan doriyan,
Chann naalon sohniyan ne teriyan loriyan,
Dil wali gal ajj bullan utte aayi ae,
Tere bina zindagi adhoori parchhayi ae.

[Chorus]
Tu hi meri manzil, tu hi mera raah ve,
Tere naalchalde ne mere saare saah ve,
Ishq tere ne aisa जादू jagaaya ae,
Har ik pal hunnjannat banaaya ae.

[Verse 2]
Akhiyan ch vasdi ae teri tasveer ve,
Tere naal likhi rab ne meri taqdeer ve,
Hawa vich ghulde ne geet mohabbatan de,
Khul gaye ne boohe ajj saariyan chahatan de.

[Bridge]
Duniya bhula ke tenu apna banaaya ae,
Dil de takhat utte tenu hi bithaaya ae.

[Chorus]
Tu hi meri manzil, tu hi mera raah ve,
Tere naal chalde ne mere saare saah ve,
Ishq tere ne aisa jaadu jagaaya ae,
Har ik pal hunn jannat banaaya ae.`;
    }

    return `[Verse 1]
Dhol diyan تھاپاں utte nachda zamana ae,
Apni hi mauj vich chalda fasana ae,
Hausle buland sade, rukde na kadde vi,
Manzilan de nede aake jhukde na kadde vi.

[Chorus]
Chardi kala vich rehnde sade honsle,
Aasman chhunde vekh sade faasle,
Dil vich josh te zubaan utte geet ae,
Har ik kadam utte apni hi jeet ae.

[Verse 2]
Raatan nu vi chamke sitareyan di chaadar,
Mehnat de naal banne zindagi bahadar,
Yaaran diyan toliyan te khushiyan da mela ae,
Sajdasavera te suhana har vela ae.

[Bridge]
Rukna nahi ajj, bas uchi udaan ae,
Apne iraadeyan naal apni pehchan ae.

[Chorus]
Chardi kala vich rehnde sade honsle,
Aasman chhunde vekh sade faasle,
Dil vich josh te zubaan utte geet ae,
Har ik kadam utte apni hi jeet ae.`;
  }

  if (lang === 'Hinglish') {
    return `[Verse 1]
City lights चमकें and the night is feeling young,
Dil ki dhadkan beats to the song upon my tongue,
Chhod de tu kal ki saari tension aur fikar,
Every single moment shines brighter than gold and silver.

[Chorus]
Apna hai time, yeah we own the night,
Sapno ke pankh leke we are taking flight,
Dil se mila le dil, feel the magic vibe,
Nothing gonna stop us when the music comes alive.

[Verse 2]
Bass drops heavy aur kadam na rukein aaj,
Apni hi dhun ka hai dil pe poora raaj,
Stars in the sky jaise raste bulayein,
Har ek beat pe hum khul ke muskurayein.

[Bridge]
No looking back now, hawaon mein hai josh,
Let the rhythm take control, uda de saare hosh.

[Chorus]
Apna hai time, yeah we own the night,
Sapno ke pankh leke we are taking flight,
Dil se mila le dil, feel the magic vibe,
Nothing gonna stop us when the music comes alive.`;
  }

  if (lang === 'English') {
    if (isRomantic) {
      return `[Verse 1]
Golden shadows falling softly on the avenue,
Every quiet melody is leading back to you,
Whispers in the evening breeze are calling out your name,
Nothing in this restless world will ever feel the same.

[Chorus]
Hold me in the rhythm of a thousand shining stars,
Love becomes the compass showing everything we are,
Dancing through the midnight till the sky begins to glow,
Never let the music fade, never let me go.

[Verse 2]
Every heartbeat echoes like a promise in the dark,
Two colliding galaxies ignited by a spark,
Time is standing still whenever you are by my side,
Drifting on the ocean of a warm electric tide.

[Bridge]
Through the highs and lows we rise above the clouds tonight,
Turning every shadow into everlasting light.

[Chorus]
Hold me in the rhythm of a thousand shining stars,
Love becomes the compass showing everything we are,
Dancing through the midnight till the sky begins to glow,
Never let the music fade, never let me go.`;
    }

    return `[Verse 1]
Stepping through the neon lights with fire in our eyes,
Chasing every horizon underneath electric skies,
Hear the drums awakening the thunder in our chest,
Never slowing down until we reach the very best.

[Chorus]
We are shining brighter than the sun above the clouds,
Singing out our anthem to the rhythm of theek crowds,
Every beat is lifting us to places never known,
Standing on the edge of every dream we call our own.

[Verse 2]
Doubts are fading quickly in the rearview mirror glow,
Every open highway is a stage for us to show,
Heartbeats sync together as the melody unfolds,
Turning every fleeting second into purest gold.

[Bridge]
Raise your hands into the air and feel the sudden rush,
Breaking through the silence with a fearless lightning touch.

[Chorus]
We are shining brighter than the sun above the clouds,
Singing out our anthem to the rhythm of the crowds,
Every beat is lifting us to places never known,
Standing on the edge of every dream we call our own.`;
  }

  if (lang === 'Tamil') {
    return `[Verse 1]
Vaanam thodum thooram indru kaalil vandhadhe,
Kaatril varum raagam nenjil poo malarndhadhe,
Kanavugal ellaam indru nijamaagum nerame,
Ulagame namadhu paattil ullasamaai aadume.

[Chorus]
Pudhu veguam, pudhu thாளം, nenjukkulle pongudhe,
Vetri kodi vaanam engum uyaravaai parakkudhe,
Thadaigalai thaandi naamum munne selluvom,
Oliyinai pola indru ulagai velluvom.

[Verse 2]
Iravinil minnum vinmeen vazhi kaattudhe,
Idhayathin osai nalla thாளം kottudhe,
Nambikkaiyin deepam endrum anaiyaadhu paar,
Namadhu payanam indru yaarum thadukkaadhu paar.

[Bridge]
Siragugal virithu naamum vaanil parappom,
Santhosha geetham paadi sigaram thoduvom.

[Chorus]
Pudhu vegam, pudhu thaalam, nenjukkulle pongudhe,
Vetri kodi vaanam engum uyaravaai parakkudhe,
Thadaigalai thaandi naamum munne selluvom,
Oliyinai pola indru ulagai velluvom.`;
  }

  if (lang === 'Telugu') {
    return `[Verse 1]
Ningilona taaralanni manatho saagene,
Gundelona kotha raagam paata paadene,
Kalalanni నిజమయ్యే vela vacheraa,
Chirunavvu thoti lokam veligipoyeraa.

[Chorus]
Saagipo, saagipo, aakasham neederaa,
Gelupu pilupu neeku eduru chooseraa,
Prathi adugu oka kotha sangeetham,
Manasu ninda ponge aananda geetham.

[Verse 2]
Gaalilonaparimalalu mananu thaakene,
Uthsaham urakalesi parugu theesene,
Aashalanni rekkaluga maari egirene,
cheekatanta veedi kotha velugu నిండెనే.

[Bridge]
Aagipoku ఎప్పుడూ nee gamyam cheraga,
Prapanchame ninnu choosi murisipovaga.

[Chorus]
Saagipo, saagipo, aakasham neederaa,
Gelupu pilupu neeku eduru chooseraa,
Prathi adugu oka kotha sangeetham,
Manasu ninda ponge aananda geetham.`;
  }

  // Default: Hindi (with distinct poetic rhyming lyrics for Romantic, Melancholic, Chill, and Upbeat/Happy)
  if (isRomantic) {
    return `[Verse 1]
Teri aankhon mein jo khamosh sitaare chamkein,
Mere dil ke yeh sabhi taar tumhi se dhadkein,
Hawa chhu kar jo guzarti hai teri zulfon ko,
Nayaik geet सुनाती hai meri saanson ko.

[Chorus]
Tu jo paas aaye toh har lamha suhana laage,
Bina tere yeh jahaan saara begana laage,
Dil ki har baat tujhe aaj sunaani hai mujhe,
Apni har shaam tere naam bitaani hai mujhe.

[Verse 2]
Chaandni raat mein khilti hai teri muskaanein,
Tujhpe aakar hi ruken meri sabhi pehchaanein,
Tere kadmon se sajey pyaar ki har ek gali,
Tere sang khil uthi armaanon ki har ek kali.

[Bridge]
Waqt tham jaaye yahin, bas tera saath rahe,
Mere haathon mein hamesha tera hi haath rahe.

[Chorus]
Tu jo paas aaye toh har lamha suhana laage,
Bina tere yeh jahaan saara begana laage,
Dil ki har baat tujhe aaj sunaani hai mujhe,
Apni har shaam tere naam bitaani hai mujhe.`;
  }

  if (isMelancholic) {
    return `[Verse 1]
Bheegi सड़कों pewoh yaadon ke nishaan baaqi hain,
Kuch adhoori si kahani ke bayaan baaqi hain,
Raat dhalti hai magar neend nahin aati hai,
Purani dhun koi khamoshi mein bulati hai.

[Chorus]
Phir bhi dil mein kahin umeed ka taara chamke,
Toote khwabon ke beech naya savera damke,
Jo guzar gaya usey hawaon mein beh jaane de,
Zindagi ko ek nayi baat keh jaane de.

[Verse 2]
Khidkiyon pe woh barasti hui boondein poochhein,
Kyun purane hi sawalon mein khayal uljhein,
Har andhere ke peeche subah ki roshni hai,
Har khamoshi mein chhupi ek nayi raagini hai.

[Bridge]
Aansuon ko ponchh kar phir se muskurana hai,
Bikhre lamhon se naya geet sajana hai.

[Chorus]
Phir bhi dil mein kahin umeed ka taara chamke,
Toote khwabon ke beech naya savera damke,
Jo guzar gaya usey hawaon mein beh jaane de,
Zindagi ko ek nayi baat keh jaane de.`;
  }

  if (isChill) {
    return `[Verse 1]
Halki si dhoop hai aur thandi hawaon ka safar,
Bheed se door kahin khud se mila hai yeh nazar,
Meethi si dhun pe kadam haule se chalte jaayein,
Har ghadi zindagi ke rang badalte jaayein.

[Chorus]
Chal udein baadalon ke paar bina parwah ke,
Geet gaate hue har mod pe is raah ke,
Dil ki aawaaz suno, waqt ko beh jaane do,
Aaj ke pal ko hamesha ke liye reh jaane do.

[Verse 2]
Shaam ke rang dekho aasman pe bikhre hain,
Saare ehsaas naye roop mein ab nikhre hain,
Koi jaldi na koi shor yahan aata hai,
Mann ka har kona sukoon-e-dil hi paata hai.

[Bridge]
Aankhein band karke zara meelon tak udaan bharo,
Apne har khwab pe tum aaj se yakeen karo.

[Chorus]
Chal udein baadalon ke paar bina parwah ke,
Geet gaate hue har mod pe is raah ke,
Dil ki aawaaz suno, waqt ko beh jaane do,
Aaj ke pal ko hamesha ke liye reh jaane do.`;
  }

  return `[Verse 1]
Nayi subah ki kiran leke ujala aayi,
Dil ki dhadkan mein nayi aaj tarang chhaayi,
Sapne aankhon mein sajaye hum kadam badhaayein,
Apni mehnat se naya aasman chhu jaayein.

[Chorus]
Uth ke chal, rukna mana hai, yeh zamana apna,
Sach karenge aaj har ek suhana sapna,
Dil mein hai josh, zubaan pe hai khushi ka taraana,
Dekhta reh jaayega humko yeh saara zamana.

[Verse 2]
Raste mushkil sahi, hausla chattan sa hai,
Har irada aaj toofan ke samaan sa hai,
Sursajey, taal miley, jhoom uthey har mehfil,
Jeet hi jeet likhi hai jahan jaaye yeh dil.

[Bridge]
Pankh phaila ke hawaon ka rukh modenge hum,
Har sitaare ko zameen laake ab jodenge hum.

[Chorus]
Uth ke chal, rukna mana hai, yeh zamana apna,
Sach karenge aaj har ek suhana sapna,
Dil mein hai josh, zubaan pe hai khushi ka taraana,
Dekhta reh jaayega humko yeh saara zamana.`;
}

export function buildMusicalStyleHeader(prefs: MusicPreferences): string {
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

  const [bass, warmth, mids, presence, air] = prefs.soundBalance;
  const mixNotes: string[] = [];
  if (bass >= 65) mixNotes.push('boomy sub-bass and deep low-end punch');
  if (warmth >= 65) mixNotes.push('warm analog low-mid body');
  if (mids >= 65) mixNotes.push('forward, expressive lead vocals and melodies');
  if (presence >= 65) mixNotes.push('crisp percussion transient attack');
  if (air >= 65) mixNotes.push('shimmering high-end air and wide stereo sparkle');
  const mixDescription =
    mixNotes.length > 0
      ? `Mix & tonal balance: ${mixNotes.join(', ')}.`
      : 'Mix & tonal balance: well-balanced studio master with clear vocal presence.';

  const isInstrumental = prefs.sound === 'Instrumental' || prefs.model === 'lyria-realtime-exp';
  const effectiveLanguage = resolveEffectiveLanguage(prefs);
  const customAddition = prefs.customPrompt.trim()
    ? ` Additional direction: ${prefs.customPrompt.trim()}.`
    : '';

  if (isInstrumental) {
    return `Create a ${SOUND_DESCRIPTORS[prefs.sound] || prefs.sound} track. Mood: ${VIBE_DESCRIPTORS[prefs.vibe] || prefs.vibe}. Emotion: ${FEELING_DESCRIPTORS[prefs.feeling] || prefs.feeling}. Instruments: ${selectedInstruments}. Tempo & Energy: ${tempoLabel}, ${energyLabel}. ${mixDescription} Strictly instrumental only, no vocals.${customAddition}`;
  }

  return `Create a ${SOUND_DESCRIPTORS[prefs.sound] || prefs.sound} song sung in ${effectiveLanguage} with clear, expressive ${effectiveLanguage} vocals. Mood: ${VIBE_DESCRIPTORS[prefs.vibe] || prefs.vibe}. Emotion: ${FEELING_DESCRIPTORS[prefs.feeling] || prefs.feeling}. Instruments: ${selectedInstruments}. Tempo & Energy: ${tempoLabel}, ${energyLabel}. ${mixDescription}${customAddition}`;
}

export function buildLyriaPrompt(prefs: MusicPreferences, customLyrics?: string): string {
  const styleHeader = buildMusicalStyleHeader(prefs);
  const isInstrumental = prefs.sound === 'Instrumental' || prefs.model === 'lyria-realtime-exp';

  if (isInstrumental) {
    return styleHeader;
  }

  const lyrics = (customLyrics || buildCuratedRhymingLyrics(prefs)).trim();
  return `${styleHeader}, with the following lyrics:\n\n${lyrics}`;
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
  const styleHeader = buildMusicalStyleHeader(prefs);
  const fallbackLyrics = buildCuratedRhymingLyrics(prefs);
  const prompt = buildLyriaPrompt(prefs, fallbackLyrics);
  const effectiveLanguage = resolveEffectiveLanguage(prefs);
  const isInstrumental = prefs.sound === 'Instrumental' || prefs.model === 'lyria-realtime-exp';
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
      styleHeader,
      fallbackLyrics,
      language: effectiveLanguage,
      vibe: prefs.vibe,
      sound: prefs.sound,
      feeling: prefs.feeling,
      customPrompt: prefs.customPrompt,
      isInstrumental,
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
    lyrics: data.lyrics || fallbackLyrics,
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
    lyrics: buildCuratedRhymingLyrics(prefs),
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
