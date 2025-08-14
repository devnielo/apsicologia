import type { ObjectId, ITimestamps, ISoftDelete } from './common.js';

export interface IService extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  category: string;
  color?: string;
  isOnline: boolean;
  isActive: boolean;
  requiresRoom: boolean;
  allowedRoomTypes?: ('physical' | 'virtual')[];
  professionalIds: ObjectId[]; // Professionals who can provide this service
  preparationTime?: number; // Minutes before appointment
  followUpTime?: number; // Minutes after appointment
  maxAdvanceBooking?: number; // Days in advance
  minAdvanceBooking?: number; // Hours in advance
  cancellationPolicy?: {
    freeUntilHours: number;
    refundPercentage: number;
  };
  tags: string[];
  images?: string[];
  instructions?: string; // Instructions for patients
  requirements?: string[]; // What patients should bring/prepare
}

export interface IServiceCreateInput {
  name: string;
  description?: string;
  duration: number;
  price: number;
  currency?: string;
  category: string;
  color?: string;
  isOnline?: boolean;
  requiresRoom?: boolean;
  allowedRoomTypes?: ('physical' | 'virtual')[];
  professionalIds?: ObjectId[];
  preparationTime?: number;
  followUpTime?: number;
  maxAdvanceBooking?: number;
  minAdvanceBooking?: number;
  cancellationPolicy?: {
    freeUntilHours: number;
    refundPercentage: number;
  };
  tags?: string[];
  instructions?: string;
  requirements?: string[];
}

export interface IServiceCategory {
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}
