import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env, resolvedUploadDir } from './config';

export interface UploadResult {
  fileKey: string;
  url: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

let s3Client: S3Client | null = null;
if (env.STORAGE_DRIVER === 's3') {
  s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    } : undefined,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  });
}

export async function initStorage() {
  if (env.STORAGE_DRIVER === 'local') {
    await fs.mkdir(resolvedUploadDir, { recursive: true });
    await fs.mkdir(path.join(resolvedUploadDir, 'products'), { recursive: true });
    await fs.mkdir(path.join(resolvedUploadDir, 'branding'), { recursive: true });
  }
}

export function validateImage(buffer: Buffer, mimetype: string): void {
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    throw new Error(`Tipo de arquivo não permitido: ${mimetype}. Permitidos: JPEG, PNG, WebP, AVIF`);
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Arquivo excede o tamanho máximo permitido de 5MB (tamanho atual: ${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  }
}

export async function saveFile(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  folder = 'products'
): Promise<UploadResult> {
  validateImage(buffer, mimetype);

  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const randomName = `${crypto.randomUUID()}${ext}`;
  const fileKey = `${folder}/${randomName}`;

  if (env.STORAGE_DRIVER === 's3' && s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: fileKey,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    const publicUrl = env.S3_ENDPOINT
      ? `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${fileKey}`
      : `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${fileKey}`;

    return { fileKey, url: publicUrl };
  } else {
    // Armazenamento local
    const targetDir = path.join(resolvedUploadDir, folder);
    await fs.mkdir(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, randomName);
    await fs.writeFile(targetPath, buffer);

    const publicUrl = `/uploads/${fileKey}`;
    return { fileKey, url: publicUrl };
  }
}

export async function deleteFile(fileKey: string): Promise<void> {
  if (!fileKey) return;

  if (env.STORAGE_DRIVER === 's3' && s3Client) {
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: fileKey,
        })
      );
    } catch (err) {
      console.warn(`Não foi possível remover arquivo do S3: ${fileKey}`, err);
    }
  } else {
    try {
      const localPath = path.join(resolvedUploadDir, fileKey);
      await fs.unlink(localPath);
    } catch {
      // Ignora erro se já não existir
    }
  }
}
