import { getEnv } from "../../../config/index.js";
import type { TTSProvider, SynthesizeParams, SynthesizeResult } from "../tts-provider.js";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

/**
 * ElevenLabs TTSProvider implementation.
 * Uses HTTP fetch — no heavy SDK required.
 */
export class ElevenLabsTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor() {
    const env = getEnv();
    if (!env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is required for ElevenLabs TTS provider");
    }
    this.apiKey = env.ELEVENLABS_API_KEY;
  }

  async synthesize(params: SynthesizeParams): Promise<SynthesizeResult> {
    const voiceId = params.voiceId ?? DEFAULT_VOICE_ID;

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
          model_id: "eleven_monolingual_v1",
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
