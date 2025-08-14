import type { ObjectId, UserRole, ITimestamps, ISoftDelete } from './common.js';

export interface IUser extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  professionalId?: ObjectId;
  patientId?: ObjectId;
  twoFASecret?: string;
  twoFAEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  avatar?: string;
  timezone: string;
  locale: string;
  preferences: IUserPreferences;
}

export interface IUserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointments: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    language: string;
  };
  calendar: {
    defaultView: 'month' | 'week' | 'day';
    weekStart: 0 | 1; // 0 = Sunday, 1 = Monday
    timeFormat: '12h' | '24h';
    showWeekends: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    shareCalendar: boolean;
  };
}

export interface IUserCreateInput {
  email: string;
  phone?: string;
  name: string;
  password: string;
  role: UserRole;
  professionalId?: ObjectId;
  patientId?: ObjectId;
  timezone?: string;
  locale?: string;
}

export interface IUserUpdateInput {
  email?: string;
  phone?: string;
  name?: string;
  timezone?: string;
  locale?: string;
  preferences?: Partial<IUserPreferences>;
  avatar?: string;
}

export interface IUserLoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IUserRegisterInput {
  email: string;
  phone?: string;
  name: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
}

export interface IPasswordResetInput {
  email: string;
}

export interface IPasswordResetConfirmInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ITwoFASetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export interface ITwoFAVerifyInput {
  token: string;
  backupCode?: string;
}

export interface IUserSession {
  userId: ObjectId;
  email: string;
  name: string;
  role: UserRole;
  professionalId?: ObjectId;
  patientId?: ObjectId;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface IUserPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  conditions?: Record<string, any>;
}

export interface IUserProfile {
  _id: ObjectId;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  timezone: string;
  locale: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFAEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  preferences: IUserPreferences;
  professional?: {
    _id: ObjectId;
    name: string;
    specialties: string[];
  };
  patient?: {
    _id: ObjectId;
    name: string;
    phone: string;
  };
}

// DTOs for API responses (without sensitive data)
export interface IUserPublic {
  _id: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface IUserAdmin extends IUserPublic {
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFAEnabled: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  professionalId?: ObjectId;
  patientId?: ObjectId;
}
