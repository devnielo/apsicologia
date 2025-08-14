import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { httpLogger } from './config/logger.js';
import env from './config/env.js';
import database from './config/database.js';
import redis from './config/redis.js';
import logger from './config/logger.js';

// Import middleware
import { errorHandler } from './middleware/error.js';
import { notFound } from './middleware/notFound.js';

// Import routes (will be created later)
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
// import patientRoutes from './routes/patients.js';
// import professionalRoutes from './routes/professionals.js';
// import appointmentRoutes from './routes/appointments.js';

const app: Application = express();

// Trust proxy for rate limiting and real IP detection
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

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim()),
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

// HTTP logging
app.use(httpLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: {
      database: database.isConnected(),
      redis: redis.isConnected(),
    },
  };

  const httpStatus = health.services.database && health.services.redis ? 200 : 503;
  res.status(httpStatus).json(health);
});

// API version endpoint
app.get('/api', (req, res) => {
  res.json({
    name: env.APP_NAME,
    version: '0.1.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes (will be uncommented as we create them)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/patients', patientRoutes);
// app.use('/api/professionals', professionalRoutes);
// app.use('/api/appointments', appointmentRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database and redis connections
    Promise.all([
      database.disconnect(),
      redis.disconnect(),
    ])
      .then(() => {
        logger.info('All connections closed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      });
  });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to services
    await database.connect();
    await redis.connect();
    
    // Start HTTP server
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`🚀 Server running on ${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📋 Health check: http://${env.HOST}:${env.PORT}/health`);
      logger.info(`🔧 API info: http://${env.HOST}:${env.PORT}/api`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for graceful shutdown
let server: any;

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().then((s) => {
    server = s;
  });
}

export default app;
