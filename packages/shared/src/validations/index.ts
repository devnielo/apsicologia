import { z } from 'zod';

// Common validations
export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const EmailSchema = z.string().email('Invalid email format');

export const PhoneSchema = z.string().regex(/^(\+34|0034|34)?[6-9]\d{8}$/, 'Invalid phone number');

export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number');

// User validations
export const UserCreateSchema = z.object({
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: PasswordSchema,
  role: z.enum(['admin', 'professional', 'reception', 'patient']),
  professionalId: ObjectIdSchema.optional(),
  patientId: ObjectIdSchema.optional(),
});

export const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Patient validations
export const PatientCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: EmailSchema,
  phone: PhoneSchema,
  birthDate: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

// Appointment validations
export const AppointmentCreateSchema = z.object({
  patientId: ObjectIdSchema,
  professionalId: ObjectIdSchema,
  serviceId: ObjectIdSchema,
  roomId: ObjectIdSchema.optional(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  notes: z.string().optional(),
});

// Service validations
export const ServiceCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  category: z.string().min(1, 'Category is required'),
  isOnline: z.boolean().default(false),
  requiresRoom: z.boolean().default(true),
});

// Professional validations
export const ProfessionalCreateSchema = z.object({
  userId: ObjectIdSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  bufferMinutes: z.number().min(0).default(15),
  telehealthEnabled: z.boolean().default(false),
});

// Room validations
export const RoomCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['physical', 'virtual']),
  capacity: z.number().min(1).optional(),
  location: z.string().optional(),
});

// Form validations
export const FormCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  jsonSchema: z.record(z.any()),
  uiSchema: z.record(z.any()).optional(),
  isPublic: z.boolean().default(false),
  requiresAuth: z.boolean().default(true),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Search filters
export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  status: z.array(z.string()).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  professionalId: ObjectIdSchema.optional(),
  patientId: ObjectIdSchema.optional(),
  serviceId: ObjectIdSchema.optional(),
  roomId: ObjectIdSchema.optional(),
});

// Re-export zod for convenience
export { z, ZodError } from 'zod';
