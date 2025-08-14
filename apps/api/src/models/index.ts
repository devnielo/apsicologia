// Export all models
export { User } from './User.js';
export { Patient } from './Patient.js';
export { Professional } from './Professional.js';

// Export types separately
export type { IUserDocument } from './User.js';
export type { IPatientDocument } from './Patient.js';
export type { IProfessionalDocument } from './Professional.js';

// Re-export types for convenience
export type * from '@apsicologia/shared/types';
