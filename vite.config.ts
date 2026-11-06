import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI, type LiveMusicServerMessage } from '@google/genai';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

type LyriaModelId =
  | 'lyria-3.5'
  | 'lyria-3-clip-preview'
  | 'lyria-3-pro-preview'
  | 'lyria-realtime-exp';

interface GenerateMusicRequestBody {
  prompt: string;
  styleHeader?: string;
  fallbackLyrics?: string;
  language?: string;
  vibe?: string;
  sound?: string;
  feeling?: string;
  customPrompt?: string;
  isInstrumental?: boolean;
  model?: LyriaModelId;
  bpm?: number;
  weightedPrompt?: string;
}

/**
 * Uses `gemini-2.5-flash` as a master lyricist to compose bespoke, poetic, strictly rhyming
 * song lyrics (`[Verse 1]`, `[Chorus]`, `[Verse 2]`, `[Bridge]`, `[Chorus]`) in the chosen
 * language and mood before passing them to Lyria 3.5. Falls back to `fallbackLyrics` if unavailable.
 */
async function composeRhymingLyricsWithGemini(
  body: GenerateMusicRequestBody,
  apiKey: string
): Promise<string | undefined> {
  if (body.isInstrumental || !body.styleHeader) {
    return undefined;
  }

  const language = body.language || 'Hindi';
  const songwriterPrompt = `You are an award-winning ${language} songwriter and poet (like Gulzar, Irshad Kamil, and Amitabh Bhattacharya for Hindi; Sidhu Moose Wala / Diljit / Karan Aujla style for Punjabi).
Write meaningful, emotionally resonant, real song lyrics with strict end-rhymes (AABB or ABAB) and smooth, singable syllable meter.

Song Details:
- Language: ${language} (write in clean, natural Romanized ${language} script so the vocal synthesizer sings every word and rhyme with crystal-clear pronunciation)
- Musical Style: ${body.sound || 'Modern Indian Pop'}
- Mood / Vibe: ${body.vibe || 'Uplifting'}
- Emotional Feeling: ${body.feeling || 'Heartfelt'}
${body.customPrompt?.trim() ? `- User's Topic / Custom Request: "${body.customPrompt.trim()}"` : ''}

Strict Requirements:
1. Every couplet MUST rhyme naturally at the end of the lines (e.g. aayi/chhaayi, apna/sapna, raah ve/saah ve, night/flight) and tell a coherent, heartfelt story — NEVER use random disconnected words.
2. Keep line lengths balanced (8 to 12 syllables per line) so they fit a musical melody naturally.
3. Output ONLY the structured lyrics using these exact section tags and NO other intro/outro text or stage directions:

[Verse 1]
(4 rhyming lines)

[Chorus]
(4 catchy, memorable rhyming hook lines)

[Verse 2]
(4 rhyming lines that deepen the story)

[Bridge]
(2 to 4 emotional peak rhyming lines)

[Chorus]
(Repeat the 4 catchy rhyming hook lines)`;

  try {
    const client = new GoogleGenAI({ apiKey });
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 6500)
    );
    const genPromise = client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: songwriterPrompt,
    });

    const response = await Promise.race([genPromise, timeoutPromise]);
    const text = response?.text?.trim();
    if (text && text.includes('[Verse') && text.includes('[Chorus]')) {
      return text;
    }
  } catch {
    // Fall back to curated rhyming lyrics
  }

  return body.fallbackLyrics;
}

function isModelNotFoundOrUnsupportedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('does not exist')
  );
}

function pcm16ChunksToWavBase64(
  chunks: Buffer[],
  sampleRate: number = 48000,
  numChannels: number = 2
): string {
  const dataLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM header size
  header.writeUInt16LE(1, 20); // PCM format = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28); // byteRate
  header.writeUInt16LE(numChannels * 2, 32); // blockAlign
  header.writeUInt16LE(16, 34); // bitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, ...chunks]).toString('base64');
}

async function callLyriaInteractionsServer(
  model: 'lyria-3.5' | 'lyria-3-clip-preview' | 'lyria-3-pro-preview',
  prompt: string,
  apiKey: string
) {
  const client = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
  });

  let interaction;
  try {
    interaction = await client.interactions.create({
      model,
      input: prompt,
      api_version: 'v1beta',
    });
  } catch (err: unknown) {
    if (model === 'lyria-3.5' && isModelNotFoundOrUnsupportedError(err)) {
      interaction = await client.interactions.create({
        model,
        input: prompt,
        api_version: 'v1',
      });
    } else {
      throw err;
    }
  }

  let audioBase64: string | undefined = interaction.output_audio?.data;
  let mimeType: string = interaction.output_audio?.mime_type || 'audio/mp3';
  let lyrics: string | undefined = interaction.output_text || undefined;

  if (!audioBase64 && Array.isArray(interaction.steps)) {
    const textParts: string[] = [];
    for (const step of interaction.steps) {
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.type === 'audio' && item.data) {
            audioBase64 = item.data;
            if (item.mime_type) {
              mimeType = item.mime_type;
            }
          } else if (item.type === 'text' && item.text) {
            textParts.push(item.text);
          }
        }
      }
    }
    if (!lyrics && textParts.length > 0) {
      lyrics = textParts.join('\n\n');
    }
  }

  if (!audioBase64) {
    throw new Error(
      `Model '${model}' completed the interaction, but no audio stream was returned.`
    );
  }

  return {
    id: interaction.id || `lyria-${Date.now()}`,
    audioBase64,
    mimeType,
    lyrics,
    modelUsed: model,
  };
}

async function callLyriaRealTimeServer(
  weightedPrompt: string,
  bpm: number,
  apiKey: string
) {
  const targetDurationSeconds = 14;
  const targetBytes = 48000 * 2 * 2 * targetDurationSeconds;

  const attemptRealTime = (apiVersion: 'v1beta' | 'v1alpha') =>
    new Promise<{
      id: string;
      audioBase64: string;
      mimeType: string;
      lyrics?: string;
      modelUsed: string;
    }>((resolve, reject) => {
      const client = new GoogleGenAI({
        apiKey,
        apiVersion,
      });

      const pcmChunks: Buffer[] = [];
      let totalBytes = 0;
      let settled = false;
      let sessionRef: { stop?: () => void; close?: () => void } | null = null;

      const finishWithAudio = () => {
        if (settled) return;
        settled = true;
        clearTimeout(overallTimeout);
        try {
          sessionRef?.stop?.();
          sessionRef?.close?.();
        } catch {
          // Ignore close errors
        }

        if (pcmChunks.length === 0) {
          reject(new Error(`Lyria RealTime (${apiVersion}) closed before streaming audio chunks.`));
          return;
        }

        const audioBase64 = pcm16ChunksToWavBase64(pcmChunks, 48000, 2);
        resolve({
          id: `lyria-rt-${Date.now()}`,
          audioBase64,
          mimeType: 'audio/wav',
          modelUsed: 'lyria-realtime-exp',
        });
      };

      const failWithError = (err: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(overallTimeout);
        try {
          sessionRef?.close?.();
        } catch {
          // Ignore close errors
        }
        reject(
          err instanceof Error
            ? err
            : new Error('Lyria RealTime WebSocket connection failed.')
        );
      };

      const overallTimeout = setTimeout(() => {
        if (pcmChunks.length > 0) {
          finishWithAudio();
        } else {
          failWithError(new Error('Timed out waiting for Lyria RealTime audio stream.'));
        }
      }, 22000);

      client.live.music
        .connect({
          model: 'models/lyria-realtime-exp',
          callbacks: {
            onmessage: (message: LiveMusicServerMessage) => {
              const chunks = message.serverContent?.audioChunks;
              if (Array.isArray(chunks)) {
                for (const chunk of chunks) {
                  if (chunk.data) {
                    const buf = Buffer.from(chunk.data, 'base64');
                    pcmChunks.push(buf);
                    totalBytes += buf.byteLength;
                  }
                }
                if (totalBytes >= targetBytes) {
                  finishWithAudio();
                }
              }
            },
            onerror: (err: unknown) => {
              if (pcmChunks.length > 0) {
                finishWithAudio();
              } else {
                failWithError(err instanceof Error ? err : new Error('Lyria RealTime WebSocket error.'));
              }
            },
            onclose: () => {
              if (pcmChunks.length > 0) {
                finishWithAudio();
              } else {
                failWithError(new Error('Lyria RealTime session closed before streaming audio.'));
              }
            },
          },
        })
        .then(async (session) => {
          sessionRef = session;
          await session.setWeightedPrompts({
            weightedPrompts: [{ text: weightedPrompt, weight: 1.0 }],
          });
          await session.setMusicGenerationConfig({
            musicGenerationConfig: {
              bpm,
              temperature: 1.0,
            },
          });
          session.play();
        })
        .catch(failWithError);
    });

  try {
    return await attemptRealTime('v1beta');
  } catch {
    return await attemptRealTime('v1alpha');
  }
}

function createLyriaApiMiddleware(mode: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/api/generate-music' || req.method !== 'POST') {
      next();
      return;
    }

    const sendJson = (status: number, payload: unknown) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    };

    try {
      const env = loadEnv(mode, process.cwd(), '');
      const apiKey = (
        env.GEMINI_API_KEY ||
        env.VITE_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY ||
        ''
      ).trim();

      if (!apiKey) {
        sendJson(500, {
          error: 'Missing GEMINI_API_KEY in server .env file.',
        });
        return;
      }

      const rawChunks: Buffer[] = [];
      for await (const chunk of req) {
        rawChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const bodyText = Buffer.concat(rawChunks).toString('utf-8');
      const body = JSON.parse(bodyText || '{}') as GenerateMusicRequestBody;

      if (!body.prompt || typeof body.prompt !== 'string') {
        sendJson(400, { error: 'Missing music generation prompt.' });
        return;
      }

      const envDefaultModel = (env.LYRIA_MODEL || env.VITE_LYRIA_MODEL || 'lyria-3.5') as LyriaModelId;
      const requestedModel: LyriaModelId = body.model || envDefaultModel || 'lyria-3.5';
      const bpm = typeof body.bpm === 'number' ? body.bpm : 118;
      const weightedPrompt = body.weightedPrompt || body.prompt;

      // Compose custom rhyming lyrics via Gemini 2.5 Flash (or use curated rhyming fallbackLyrics)
      const rhymingLyrics = await composeRhymingLyricsWithGemini(body, apiKey);
      const finalLyriaPrompt =
        !body.isInstrumental && body.styleHeader && rhymingLyrics
          ? `${body.styleHeader}, with the following lyrics:\n\n${rhymingLyrics}`
          : body.prompt;

      const fallbackOrder: LyriaModelId[] = [
        requestedModel,
        'lyria-3.5',
        'lyria-3-clip-preview',
        'lyria-3-pro-preview',
        'lyria-realtime-exp',
      ].filter((m, idx, arr): m is LyriaModelId => arr.indexOf(m) === idx);

      let lastError: unknown = null;

      for (const candidateModel of fallbackOrder) {
        try {
          if (candidateModel === 'lyria-realtime-exp') {
            const result = await callLyriaRealTimeServer(weightedPrompt, bpm, apiKey);
            sendJson(200, result);
            return;
          }
          const result = await callLyriaInteractionsServer(
            candidateModel,
            finalLyriaPrompt,
            apiKey
          );
          sendJson(200, {
            ...result,
            lyrics: result.lyrics || rhymingLyrics,
          });
          return;
        } catch (err: unknown) {
          lastError = err;
          if (isModelNotFoundOrUnsupportedError(err) || candidateModel !== requestedModel) {
            continue;
          }
          try {
            const rtResult = await callLyriaRealTimeServer(weightedPrompt, bpm, apiKey);
            sendJson(200, rtResult);
            return;
          } catch {
            break;
          }
        }
      }

      const errorMessage =
        lastError instanceof Error
          ? lastError.message
          : 'Failed to generate music with Google Lyria on the server.';
      sendJson(502, { error: errorMessage });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unexpected server error during music generation.';
      sendJson(500, { error: errorMessage });
    }
  };
}

function lyriaServerApiPlugin(mode: string): Plugin {
  const middleware = createLyriaApiMiddleware(mode);
  return {
    name: 'rupay-lyria-server-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), lyriaServerApiPlugin(mode)],
}));
