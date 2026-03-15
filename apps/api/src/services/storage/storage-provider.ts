/**
 * StorageProvider interface — abstracts file storage services.
 * Used by render-engine for uploading videos and thumbnails.
 * Engines must use this interface, never the SDK directly.
 */

export interface StorageProvider {
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  getPublicUrl(key: string): string;
}
