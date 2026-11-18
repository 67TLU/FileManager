import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  STORAGE_DRIVER: z.enum(['local', 's3', 'r2']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  STORAGE_PUBLIC_URL: z.string().default('/files'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
});

export const env = envSchema.parse(process.env);