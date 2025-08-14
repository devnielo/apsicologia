import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  
  // Database
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  
  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  
  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // CORS
  CORS_ORIGIN: string[];
  
  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  
  // MinIO (File Storage)
  MINIO_ENDPOINT?: string;
  MINIO_PORT?: number;
  MINIO_USE_SSL?: boolean;
  MINIO_ACCESS_KEY?: string;
  MINIO_SECRET_KEY?: string;
  MINIO_BUCKET_NAME: string;
  
  // Jitsi Meet
  JITSI_DOMAIN?: string;
  JITSI_JWT_SECRET?: string;
  
  // Stripe (Optional)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  
  // Application
  APP_NAME: string;
  APP_URL: string;
  FRONTEND_URL: string;
}

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const config: Config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'apsicologia',
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // MinIO
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_PORT: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : undefined,
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'apsicologia-files',
  
  // Jitsi Meet
  JITSI_DOMAIN: process.env.JITSI_DOMAIN || 'meet.jit.si',
  JITSI_JWT_SECRET: process.env.JITSI_JWT_SECRET,
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Application
  APP_NAME: process.env.APP_NAME || 'apsicologia',
  APP_URL: process.env.APP_URL || 'http://localhost:3001',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default config;
