export type ScreenStep = 1 | 2 | 3 | 4;

export type LyriaModelId =
  | 'lyria-3.5'
  | 'lyria-3-clip-preview'
  | 'lyria-3-pro-preview'
  | 'lyria-realtime-exp';

export type SongLanguage =
  | 'Hindi'
  | 'Punjabi'
  | 'Hinglish'
  | 'English'
  | 'Tamil'
  | 'Telugu';

export interface MusicPreferences {
  vibe: string;
  sound: string;
  instruments: string[];
  feeling: string;
  language: SongLanguage;
  beatSpeed: number; // 0 (Slow) to 100 (Fast)
  energyLevel: number; // 0 (Chill) to 100 (Full Power)
  soundBalance: [number, number, number, number, number]; // 5 vertical EQ/balance sliders (0-100)
  customPrompt: string;
  model: LyriaModelId;
}

export interface GeneratedTrack {
  id: string;
  title: string;
  subtitleTags: string;
  audioUrl: string;
  audioBlob?: Blob;
  cloudinaryUrl?: string;
  cloudinaryDownloadUrl?: string;
  cloudinaryUploadError?: string;
  mimeType: string;
  lyrics?: string;
  promptUsed: string;
  modelUsed: string;
  createdAt: string;
  isDemoFallback?: boolean;
}

export const VIBE_OPTIONS = [
  'Full On Happy',
  'Chill Scene',
  'Feeling Blue',
  'Mystery Mode',
  'Ishq Vibes',
  'Party Sharty',
] as const;

export const SOUND_OPTIONS = [
  'Bollywood Tadaka',
  'Punjabi Pop',
  'EDM Bangers',
  'Hip-Hop Swag',
  'Jazz Vibes',
  'Rockstar Mode',
  'Cinematic',
  'Bhangra Beats',
  'Instrumental',
] as const;

export const INSTRUMENT_OPTIONS = [
  'Piano Magic',
  'Guitar Swag',
  'Violin Vibes',
  'Flute Flow',
  'Tabla Tadka',
  'Dhol Power',
  'Drum Beats',
  'Sitar Soul',
  'Synth Sounds',
] as const;

export const FEELING_GRID_OPTIONS = [
  'Dil Se',
  'Soulful',
  'Royal Swag',
  'Dark Mode',
  'Old-School Feels',
  'Spiritual',
] as const;

export const FEELING_BOTTOM_OPTIONS = [
  'Dreamy Scene',
  'Chardi Kala',
] as const;

export const LANGUAGE_OPTIONS: readonly SongLanguage[] = [
  'Hindi',
  'Punjabi',
  'Hinglish',
  'English',
  'Tamil',
  'Telugu',
] as const;

export const SOUND_BALANCE_LABELS = [
  'Bass',
  'Warmth',
  'Mids',
  'Presence',
  'Air',
] as const;
