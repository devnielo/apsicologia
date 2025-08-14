# Contexto Técnico - apsicologia

## Stack Tecnológico Detallado

### Runtime y Base
- **Node.js:** v20 LTS (con ES modules)
- **Package Manager:** pnpm (workspaces para monorepo)
- **TypeScript:** v5+ con strict mode
- **Docker:** Multi-stage builds para producción

### Backend Core
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "redis": "^4.6.0",
  "bullmq": "^4.0.0",
  "nodemailer": "^6.9.0",
  "pino": "^8.15.0",
  "zod": "^3.22.0",
  "helmet": "^7.0.0",
  "cors": "^2.8.0",
  "argon2": "^0.31.0",
  "jsonwebtoken": "^9.0.0",
  "multer": "^1.4.0"
}
```

### Frontend Core
```json
{
  "next": "14.2.0",
  "react": "^18.3.0",
  "typescript": "^5.5.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest",
  "lucide-react": "^0.400.0",
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.52.0",
  "@hookform/resolvers": "^3.9.0"
}
```

### Herramientas Especializadas
```json
{
  "fullcalendar": "^6.1.0",
  "recharts": "^2.12.0",
  "@tiptap/react": "^2.5.0",
  "@rjsf/core": "^5.19.0",
  "minio": "^8.0.0",
  "date-fns": "^3.6.0",
  "ical-generator": "^7.1.0",
  "pdf-lib": "^1.17.0",
  "react-email": "^2.1.0",
  "next-intl": "^3.17.0"
}
```

## Configuración de Desarrollo

### Variables de Entorno
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/apsicologia
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=

# Jitsi
JITSI_DOMAIN=meet.jit.si
JITSI_APP_ID=

# Payments (Optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Docker Compose Services
```yaml
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  minio:
    image: minio/minio:latest
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
    
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    
  jitsi-web:
    image: jitsi/web:latest
    ports: ["8000:80"]
```

## Estructura de Datos

### Schemas Principales (Mongoose)
```typescript
// User Schema
interface IUser {
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'professional' | 'reception' | 'patient';
  professionalId?: ObjectId;
  twoFASecret?: string;
  lastLoginAt?: Date;
  isActive: boolean;
}

// Professional Schema  
interface IProfessional {
  userId: ObjectId;
  name: string;
  bio?: string;
  specialties: string[];
  services: ObjectId[];
  rooms: ObjectId[];
  weeklyAvailability: IWeeklyAvailability[];
  vacations: IDateRange[];
  timezone: string;
  bufferMinutes: number;
  telehealthEnabled: boolean;
}

// Patient Schema
interface IPatient {
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  address?: IAddress;
  emergencyContact?: IEmergencyContact;
  tags: string[];
  consents: IConsent[];
  newsletterOptIn: boolean;
  notes?: string;
  allergies?: string[];
}

// Appointment Schema
interface IAppointment {
  patientId: ObjectId;
  professionalId: ObjectId;
  serviceId: ObjectId;
  roomId?: ObjectId;
  start: Date;
  end: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  source: 'admin' | 'public' | 'patient';
  notes?: string;
  jitsiRoomId?: string;
  remindersSent: Date[];
  cancelledAt?: Date;
  cancelReason?: string;
}
```

## Configuración de Herramientas

### TailwindCSS (tailwind.config.js)
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'oklch(var(--color-primary) / <alpha-value>)',
        secondary: 'oklch(var(--color-secondary) / <alpha-value>)',
        accent: 'oklch(var(--color-accent) / <alpha-value>)',
        success: 'oklch(var(--color-success) / <alpha-value>)',
        warning: 'oklch(var(--color-warning) / <alpha-value>)',
        danger: 'oklch(var(--color-danger) / <alpha-value>)',
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
```

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'minio'],
  },
  i18n: {
    locales: ['es'],
    defaultLocale: 'es',
  },
}
```

### ESLint + Prettier
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

## Seguridad y Compliance

### Helmet Configuration
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "meet.jit.si"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS Policy
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://apsicologia.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

## Performance y Optimización

### Database Indexes
```javascript
// Compound indexes for frequent queries
appointmentSchema.index({ professionalId: 1, start: 1 });
appointmentSchema.index({ patientId: 1, start: -1 });
appointmentSchema.index({ status: 1, start: 1 });

// Text search index
patientSchema.index({ 
  name: 'text', 
  email: 'text', 
  phone: 'text' 
});
```

### Redis Caching Strategy
```javascript
// Cache keys pattern
const CACHE_KEYS = {
  USER_SESSION: (userId) => `session:${userId}`,
  PROFESSIONAL_SLOTS: (profId, date) => `slots:${profId}:${date}`,
  APPOINTMENT_COUNT: (profId, month) => `stats:${profId}:${month}`,
};

// TTL configurations
const CACHE_TTL = {
  SESSION: 24 * 60 * 60,      // 24 hours
  SLOTS: 15 * 60,             // 15 minutes
  STATS: 60 * 60,             // 1 hour
};
```

## Monitoring y Logging

### Pino Configuration
```javascript
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty'
  } : undefined,
  redact: ['password', 'token', 'authorization']
});
```

### Health Checks
```javascript
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    mongodb: await checkMongoDB(),
    redis: await checkRedis(),
    minio: await checkMinIO(),
    timestamp: Date.now()
  };
  res.json(health);
});
