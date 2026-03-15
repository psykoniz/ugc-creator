import { getEnv } from "../../../config/index.js";
import type { TTSProvider, SynthesizeParams, SynthesizeResult } from "../tts-provider.js";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

/**
 * Available ElevenLabs voices with human-readable labels.
 * voiceId values are ElevenLabs' stable IDs for their premade voices.
 */
export const ELEVENLABS_VOICES = {
  rachel: { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel (Female, Calm)" },
  domi: { id: "AZnzlk1XvdvUeBnXmlld", label: "Domi (Female, Energetic)" },
  bella: { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella (Female, Warm)" },
  josh: { id: "TxGEqnHWrfWFTfGW9XjX", label: "Josh (Male, Deep)" },
  arnold: { id: "VR6AewLTigWG4xSOukaG", label: "Arnold (Male, Strong)" },
  adam: { id: "pNInz6obpgDQGcFmaJgB", label: "Adam (Male, Neutral)" },
  sam: { id: "yoZ06aMxZJJ28mfd3POQ", label: "Sam (Male, Raspy)" },
} as const;

const DEFAULT_VOICE_ID = ELEVENLABS_VOICES.rachel.id;
const DEFAULT_MODEL_ID = "eleven_monolingual_v1";

/**
 * ElevenLabs TTSProvider implementation.
 * Uses HTTP fetch — no heavy SDK required.
 * Voice and model are configurable via env vars or per-call params.
 */
export class ElevenLabsTTSProvider implements TTSProvider {
  private apiKey: string;
  private defaultVoiceId: string;
  private modelId: string;

  constructor() {
    const env = getEnv();
    if (!env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is required for ElevenLabs TTS provider");
    }
    this.apiKey = env.ELEVENLABS_API_KEY;
    this.defaultVoiceId = env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
    this.modelId = env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID;
  }

  async synthesize(params: SynthesizeParams): Promise<SynthesizeResult> {
    const voiceId = params.voiceId ?? this.defaultVoiceId;

    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: params.text,
          model_id: this.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ElevenLabs TTS failed (${response.status}): ${body}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      audioBuffer: Buffer.from(arrayBuffer),
      contentType: "audio/mpeg",
    };
  }
}
