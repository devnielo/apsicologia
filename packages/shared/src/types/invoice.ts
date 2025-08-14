import type { ObjectId, ITimestamps, ISoftDelete, PaymentStatus } from './common.js';

export interface IInvoice extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  number: string;
  series: string;
  patientId: ObjectId;
  appointmentIds: ObjectId[];
  issueDate: Date;
  dueDate?: Date;
  items: IInvoiceItem[];
  subtotal: number;
  taxes: ITax[];
  totalTax: number;
  discounts: IDiscount[];
  totalDiscount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  terms?: string;
  pdfUrl?: string;
  sentAt?: Date;
  viewedAt?: Date;
  paymentDueDate?: Date;
}

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  serviceId?: ObjectId;
  appointmentId?: ObjectId;
  taxable: boolean;
}

export interface ITax {
  name: string;
  rate: number;
  amount: number;
  isInclusive: boolean;
}

export interface IDiscount {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface IInvoiceCreateInput {
  patientId: ObjectId;
  appointmentIds?: ObjectId[];
  items: Omit<IInvoiceItem, 'total'>[];
  notes?: string;
  terms?: string;
  dueDate?: Date;
}
