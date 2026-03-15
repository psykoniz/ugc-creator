/**
 * TTSProvider interface — abstracts text-to-speech services.
 * Used by render-engine for optional voiceover in Render Lite.
 * Engines must use this interface, never the SDK directly.
 */

export interface SynthesizeParams {
  text: string;
  voiceId?: string;
}

export interface SynthesizeResult {
  audioBuffer: Buffer;
  contentType: string;
}

export interface TTSProvider {
  synthesize(params: SynthesizeParams): Promise<SynthesizeResult>;
}
