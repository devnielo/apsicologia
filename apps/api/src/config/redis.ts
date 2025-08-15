import Redis from 'ioredis';
import pino from 'pino';
import env from './env.js';

const logger = pino({ name: 'redis' });

class RedisClient {
  private static instance: RedisClient;
  private client: Redis | null = null;

  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect(): Promise<void> {
    try {
      if (this.client && this.client.status === 'ready') {
        logger.info('Redis already connected');
        return;
      }

      logger.info('Connecting to Redis...');

      const redisConfig = {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB,
        connectTimeout: 5000,
        lazyConnect: true,
        retryDelayOnFailover: 1000,
        enableReadyCheck: true,
        maxRetriesPerRequest: 0, // No retry on failure
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
      };

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        logger.info('Redis connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis connected and ready');
      });

      this.client.on('error', (error) => {
        logger.error('Redis error:', error);
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Wait for connection to be ready
      await new Promise((resolve, reject) => {
        if (this.client?.status === 'ready') {
          resolve(void 0);
          return;
        }

        this.client?.once('ready', resolve);
        this.client?.once('error', reject);

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('Redis connection timeout'));
        }, 10000);
      });

      // Graceful shutdown
      process.on('SIGINT', () => this.disconnect());
      process.on('SIGTERM', () => this.disconnect());

    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        logger.info('Redis disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.status === 'ready';
  }

  // Cache helpers
  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    await this.client.expire(key, seconds);
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.hgetall(key);
  }
}

export default RedisClient.getInstance();
