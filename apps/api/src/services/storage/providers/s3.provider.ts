import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "../../../config/index.js";
import type { StorageProvider } from "../storage-provider.js";

/**
 * S3-compatible StorageProvider implementation.
 * Works with AWS S3, MinIO, Cloudflare R2, etc.
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    const env = getEnv();

    if (!env.S3_BUCKET || !env.S3_REGION) {
      throw new Error("S3_BUCKET and S3_REGION are required for S3 storage provider");
    }

    this.bucket = env.S3_BUCKET;

    this.client = new S3Client({
      region: env.S3_REGION,
      ...(env.S3_ENDPOINT && { endpoint: env.S3_ENDPOINT }),
      ...(env.S3_ACCESS_KEY_ID &&
        env.S3_SECRET_ACCESS_KEY && {
          credentials: {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          },
        }),
    });

    // For custom endpoints (MinIO, R2), use the endpoint as base URL
    this.publicBaseUrl = env.S3_ENDPOINT
      ? `${env.S3_ENDPOINT}/${this.bucket}`
      : `https://${this.bucket}.s3.${env.S3_REGION}.amazonaws.com`;
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}
