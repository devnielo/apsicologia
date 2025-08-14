import mongoose from 'mongoose';
import pino from 'pino';
import env from './env.js';

const logger = pino({ name: 'database' });

class Database {
  private static instance: Database;
  private connection: mongoose.Connection | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      if (this.connection?.readyState === 1) {
        logger.info('Database already connected');
        return;
      }

      logger.info('Connecting to MongoDB...');
      
      const options: mongoose.ConnectOptions = {
        dbName: env.MONGODB_DB_NAME,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      await mongoose.connect(env.MONGODB_URI, options);
      
      this.connection = mongoose.connection;
      
      this.connection.on('connected', () => {
        logger.info(`MongoDB connected to ${env.MONGODB_DB_NAME}`);
      });

      this.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      this.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', () => this.disconnect());
      process.on('SIGTERM', () => this.disconnect());

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        logger.info('Database disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  getConnection(): mongoose.Connection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection?.readyState === 1;
  }
}

export default Database.getInstance();
