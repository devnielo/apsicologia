import express, { Application, Request, Response } from 'express';
import { createServer, Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import configurations
import env from './config/env.js';
import database from './config/database.js';
import redis from './config/redis.js';

// Import routes
import apiRoutes from './routes/index.js';

console.log('🚀 Starting apsicologia API server...');

// Type-safe environment variables
const PORT = env.PORT;
const HOST = env.HOST;
const NODE_ENV = env.NODE_ENV;

// Create Express application
const app: Application = express();

// Trust proxy for load balancers
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

app.use(cookieParser());

// Static file serving removed - using Cloudflare R2 for all file storage

// Health check endpoint with service status
app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    message: 'apsicologia API is healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: NODE_ENV,
    version: '0.1.0',
    node: process.version,
    services: {
      database: {
        status: database.isConnected() ? 'connected' : 'disconnected',
        name: 'MongoDB'
      },
      redis: {
        status: redis.isConnected() ? 'connected' : 'disconnected',
        name: 'Redis'
      }
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };

  res.status(200).json(healthData);
});

// Mount API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'apsicologia API is running',
    name: env.APP_NAME,
    version: '0.1.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/info'
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Server error:', err);
  
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Create HTTP server
const httpServer: Server = createServer(app);

// Server startup function
const startServer = async (): Promise<void> => {
  try {
    // Connect to services
    console.log('🔧 Connecting to services...');
    
    // Connect to MongoDB (non-blocking)
    try {
      await database.connect();
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.warn('⚠️  MongoDB connection failed:', error instanceof Error ? error.message : 'Unknown error');
      console.warn('   → Server will continue without MongoDB');
    }
    
    // Connect to Redis (non-blocking)
    try {
      await redis.connect();
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.warn('⚠️  Redis connection failed:', error instanceof Error ? error.message : 'Unknown error');
      console.warn('   → Server will continue without Redis');
    }

    // Start HTTP server
    return new Promise((resolve, reject) => {
      httpServer.listen(PORT, HOST, () => {
        console.log(`✅ Server running on http://${HOST}:${PORT}`);
        console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
        console.log(`🔧 API info: http://${HOST}:${PORT}/api/info`);
        console.log(`🌍 Environment: ${NODE_ENV}`);
        console.log(`📦 Node.js: ${process.version}`);
        console.log(`🎯 Ready to accept connections!`);
        resolve();
      });

      httpServer.on('error', (error: Error) => {
        console.error('❌ Server failed to start:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    throw error;
  }
};

// Graceful shutdown function
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server first
  httpServer.close(async (err) => {
    if (err) {
      console.error('❌ Error closing HTTP server:', err);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed successfully');
    
    // Close database connections
    try {
      await Promise.all([
        database.disconnect().catch(err => console.warn('⚠️  Database disconnect warning:', err)),
        redis.disconnect().catch(err => console.warn('⚠️  Redis disconnect warning:', err))
      ]);
      console.log('✅ All services disconnected successfully');
    } catch (error) {
      console.warn('⚠️  Some services had disconnect warnings:', error);
    }
    
    console.log('👋 apsicologia API shutdown complete');
    process.exit(0);
  });

  // Force close after 15 seconds
  setTimeout(() => {
    console.error('⚠️  Force closing server after timeout');
    process.exit(1);
  }, 15000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
console.log('🔧 Initializing server startup...');

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export { app, httpServer };
export default app;
