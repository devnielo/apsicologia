import type { ObjectId, ITimestamps, AuditAction } from './common.js';

export interface IAuditLog extends ITimestamps {
  _id: ObjectId;
  actorId?: ObjectId;
  actorType: 'user' | 'system' | 'api';
  action: AuditAction;
  entity: string;
  entityId?: ObjectId;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata: {
    ip?: string;
    userAgent?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
  };
  level: 'info' | 'warn' | 'error';
  message: string;
  sessionId?: string;
  correlationId?: string;
}

export interface IAuditLogCreateInput {
  actorId?: ObjectId;
  actorType: 'user' | 'system' | 'api';
  action: AuditAction;
  entity: string;
  entityId?: ObjectId;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: {
    ip?: string;
    userAgent?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
  };
  level?: 'info' | 'warn' | 'error';
  message: string;
  sessionId?: string;
  correlationId?: string;
}

export interface IAuditLogSearchInput {
  actorId?: ObjectId;
  actorType?: ('user' | 'system' | 'api')[];
  action?: AuditAction[];
  entity?: string[];
  entityId?: ObjectId;
  level?: ('info' | 'warn' | 'error')[];
  dateFrom?: Date;
  dateTo?: Date;
  ip?: string;
  sessionId?: string;
  correlationId?: string;
  query?: string;
}
