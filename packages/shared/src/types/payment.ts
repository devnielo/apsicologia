import type { ObjectId, ITimestamps, PaymentStatus } from './common.js';

export interface IPayment extends ITimestamps {
  _id: ObjectId;
  invoiceId: ObjectId;
  appointmentId?: ObjectId;
  patientId: ObjectId;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'stripe' | 'paypal' | 'insurance';
  status: PaymentStatus;
  transactionId?: string;
  reference?: string;
  notes?: string;
  processedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  stripePaymentIntentId?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentCreateInput {
  invoiceId: ObjectId;
  appointmentId?: ObjectId;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'stripe' | 'paypal' | 'insurance';
  reference?: string;
  notes?: string;
}
