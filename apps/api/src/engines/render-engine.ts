/**
 * Render Engine
 * Orchestrates VideoProvider + TTSProvider + StorageProvider for Render Lite.
 * FFmpeg is used minimally for assembly.
 * No direct SDK calls — all access through provider interfaces.
 *
 * Render Lite = video render + optional TTS + minimal FFmpeg assembly + upload.
 * Not Render Full (no subtitles, music bed, watermarking, compositing).
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  getVideoProvider,
  getTTSProvider,
  getStorageProvider,
} from "../services/provider-factory.js";
import { scriptQueries } from "../db/queries/index.js";

const execFileAsync = promisify(execFile);

export interface RenderOptions {
  scriptId: string;
  enableTTS?: boolean;
}

export interface RenderOutput {
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
}

// ─── Main Render Lite Pipeline ───

export async function renderLite(options: RenderOptions): Promise<RenderOutput> {
  const script = await scriptQueries.getScriptById(options.scriptId);
  if (!script) {
    throw new Error(`Script not found: ${options.scriptId}`);
  }

  const video = getVideoProvider();
  const storage = getStorageProvider();

  // 1. Optional TTS
  let audioUrl: string | undefined;
  if (options.enableTTS) {
    const tts = getTTSProvider();
    const hookText = script.hook?.text ?? "";
    const fullText = `${hookText} ${script.body} ${script.cta}`;

    const audio = await tts.synthesize({ text: fullText });

    // Upload audio to storage
    const audioKey = `audio/${script.id}_${Date.now()}.mp3`;
    await storage.uploadFile(audioKey, audio.audioBuffer, audio.contentType);
    audioUrl = storage.getPublicUrl(audioKey);
  }

  // 2. Submit video render
  const renderId = await video.submitRender({
    scriptBody: script.body,
    style: script.style,
    audioUrl,
  });

  // 3. Poll until complete
  const result = await pollRenderCompletion(renderId);

  // 4. Download video and upload to our storage
  const videoResponse = await fetch(result.videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download rendered video: ${videoResponse.status}`);
  }
  const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

  const videoKey = `videos/${script.id}_${Date.now()}.mp4`;
  await storage.uploadFile(videoKey, videoBuffer, "video/mp4");
  const finalVideoUrl = storage.getPublicUrl(videoKey);

  // 5. Extract thumbnail via FFmpeg (minimal assembly)
  let thumbnailUrl: string | null = null;
  let duration: number | null = null;
  try {
    const thumbResult = await extractThumbnailAndDuration(videoBuffer, script.id);
    if (thumbResult.thumbnailBuffer) {
      const thumbKey = `thumbnails/${script.id}_${Date.now()}.jpg`;
      await storage.uploadFile(thumbKey, thumbResult.thumbnailBuffer, "image/jpeg");
      thumbnailUrl = storage.getPublicUrl(thumbKey);
    }
    duration = thumbResult.duration;
  } catch {
    // Non-fatal: thumbnail extraction failure shouldn't block the pipeline
    // TODO(V1.2): improve FFmpeg error handling
  }

  return {
    videoUrl: finalVideoUrl,
    thumbnailUrl,
    duration,
  };
}

// ─── Helpers ───

async function pollRenderCompletion(renderId: string, maxAttempts = 120, intervalMs = 5000) {
  const video = getVideoProvider();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await video.getRenderStatus(renderId);

    if (status.status === "completed") {
      return video.getRenderResult(renderId);
    }

    if (status.status === "failed") {
      throw new Error(`Render failed: ${status.progress ?? "unknown error"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Render timed out after ${maxAttempts * intervalMs / 1000}s`);
}

async function extractThumbnailAndDuration(
  videoBuffer: Buffer,
  scriptId: string
): Promise<{ thumbnailBuffer: Buffer | null; duration: number | null }> {
  const tempDir = await mkdtemp(join(tmpdir(), "ugc-render-"));
  const videoPath = join(tempDir, `${scriptId}.mp4`);
  const thumbPath = join(tempDir, `${scriptId}.jpg`);

  try {
    await writeFile(videoPath, videoBuffer);

    // Extract thumbnail at 1 second
    await execFileAsync("ffmpeg", [
      "-i", videoPath,
      "-ss", "1",
      "-vframes", "1",
      "-q:v", "2",
      thumbPath,
    ]);

    // Get duration
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    const duration = parseFloat(stdout.trim()) || null;
    const { readFile } = await import("node:fs/promises");
    const thumbnailBuffer = await readFile(thumbPath);

    return { thumbnailBuffer, duration };
  } finally {
    // Cleanup temp files
    await unlink(videoPath).catch(() => {});
    await unlink(thumbPath).catch(() => {});
  }
}
