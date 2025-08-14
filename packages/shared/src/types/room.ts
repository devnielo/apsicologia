import type { ObjectId, ITimestamps, ISoftDelete } from './common.js';

export interface IRoom extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  name: string;
  description?: string;
  type: 'physical' | 'virtual';
  capacity?: number;
  location?: string;
  equipment?: string[];
  features?: string[];
  isActive: boolean;
  color?: string;
  images?: string[];
  jitsiConfig?: {
    roomName: string;
    displayName?: string;
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    requireDisplayName?: boolean;
  };
  bookingSettings: {
    allowOverlap: boolean;
    bufferMinutes: number;
    advanceBookingDays: number;
  };
  accessInstructions?: string;
  technicalRequirements?: string[];
}

export interface IRoomCreateInput {
  name: string;
  description?: string;
  type: 'physical' | 'virtual';
  capacity?: number;
  location?: string;
  equipment?: string[];
  features?: string[];
  color?: string;
  jitsiConfig?: {
    roomName: string;
    displayName?: string;
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    requireDisplayName?: boolean;
  };
  bookingSettings?: {
    allowOverlap?: boolean;
    bufferMinutes?: number;
    advanceBookingDays?: number;
  };
  accessInstructions?: string;
  technicalRequirements?: string[];
}
