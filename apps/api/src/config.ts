import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET deve ter ao menos 16 caracteres'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./uploads'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional().default('baterias-estrela-media'),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuração inválida no .env:', parsed.error.format());
  throw new Error('Falha ao validar variáveis de ambiente');
}

export const env = parsed.data;

export const resolvedUploadDir = path.resolve(process.cwd(), env.STORAGE_LOCAL_DIR);
