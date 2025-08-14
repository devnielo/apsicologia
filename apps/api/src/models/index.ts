// Export all models
export { User } from './User.js';
export { Patient } from './Patient.js';
export { Professional } from './Professional.js';
export { Service } from './Service.js';
export { Room } from './Room.js';
export { Appointment } from './Appointment.js';
export { Invoice } from './Invoice.js';
export { Payment } from './Payment.js';
export { FormSchema } from './FormSchema.js';
export { FormResponse } from './FormResponse.js';
export { Note } from './Note.js';

// Export types separately
export type { IUserDocument } from './User.js';
export type { IPatientDocument } from './Patient.js';
export type { IProfessionalDocument } from './Professional.js';
export type { IServiceDocument } from './Service.js';
export type { IRoomDocument } from './Room.js';
export type { IAppointmentDocument } from './Appointment.js';
export type { IInvoiceDocument } from './Invoice.js';
export type { IPaymentDocument } from './Payment.js';
export type { IFormSchemaDocument } from './FormSchema.js';
export type { IFormResponseDocument } from './FormResponse.js';
export type { INoteDocument } from './Note.js';

// Re-export types for convenience
export type * from '@apsicologia/shared/types';
