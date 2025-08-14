import pino from 'pino';
import pinoHttp from 'pino-http';
import env, { isDevelopment } from './env.js';

// Base logger configuration
const loggerConfig: pino.LoggerOptions = {
  name: env.APP_NAME,
  level: env.LOG_LEVEL,
  
  // Pretty print in development
  ...(isDevelopment() && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),

  // Production configuration
  ...(!isDevelopment() && {
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
};

// Create base logger
const logger = pino(loggerConfig, env.LOG_FILE ? pino.destination(env.LOG_FILE) : undefined);

// HTTP logger middleware
export const httpLogger = pinoHttp({
  logger,
  
  // Custom request ID
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  
  // Custom serializers
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.headers['content-type'],
        'content-length': res.headers['content-length'],
      },
    }),
  },

  // Custom log level
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },

  // Custom success message
  customSuccessMessage: (req, res) => {
    if (res.statusCode === 404) {
      return 'resource not found';
    }
    return `${req.method} completed`;
  },

  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} errored with status ${res.statusCode}`;
  },

  // Custom attribute keys
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'timeTaken',
  },
});

// Audit logger for sensitive operations
export const auditLogger = logger.child({
  component: 'audit',
});

// Database logger
export const dbLogger = logger.child({
  component: 'database',
});

// Cache logger
export const cacheLogger = logger.child({
  component: 'cache',
});

// Authentication logger
export const authLogger = logger.child({
  component: 'auth',
});

// Email logger
export const emailLogger = logger.child({
  component: 'email',
});

// File logger
export const fileLogger = logger.child({
  component: 'files',
});

export default logger;
