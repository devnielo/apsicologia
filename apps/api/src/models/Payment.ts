import mongoose, { Document, Schema } from 'mongoose';
import { IPayment } from '@apsicologia/shared/types';

export interface IPaymentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Related entities
  invoiceId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  professionalId?: mongoose.Types.ObjectId;
  
  // Payment identification
  paymentNumber: string;
  externalTransactionId?: string;
  
  // Payment details
  amount: number;
  currency: string;
  
  // Payment method and processing
  method: 'cash' | 'card' | 'transfer' | 'check' | 'online' | 'insurance' | 'paypal' | 'stripe';
  processor?: 'stripe' | 'paypal' | 'redsys' | 'bizum' | 'internal';
  
  // Payment status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  
  // Dates
  paymentDate: Date;
  processedAt?: Date;
  
  // Payment details
  details: {
    // Card payment details
    cardLast4?: string;
    cardBrand?: string;
    cardCountry?: string;
    
    // Transfer details
    bankAccount?: string;
    transferReference?: string;
    
    // Check details
    checkNumber?: string;
    bankName?: string;
    
    // Online payment details
    gatewayTransactionId?: string;
    gatewayReference?: string;
    gatewayFee?: number;
    
    // Insurance details
    insuranceProvider?: string;
    policyNumber?: string;
    claimNumber?: string;
    authorizationCode?: string;
    
    // General
    reference?: string;
    description?: string;
  };
  
  // Fee and commission structure
  fees: {
    gatewayFee: number;
    processingFee: number;
    platformFee: number;
    totalFees: number;
    netAmount: number;
  };
  
  // Refund information
  refunds: {
    refundId: string;
    amount: number;
    reason: string;
    refundedAt: Date;
    refundMethod?: string;
    externalRefundId?: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
  
  // Reconciliation
  reconciliation: {
    isReconciled: boolean;
    reconciledAt?: Date;
    reconciledBy?: mongoose.Types.ObjectId;
    bankStatementDate?: Date;
    bankReference?: string;
    discrepancyAmount?: number;
    discrepancyNotes?: string;
  };
  
  // Fraud detection and security
  security: {
    ipAddress?: string;
    userAgent?: string;
    fraudScore?: number;
    riskLevel: 'low' | 'medium' | 'high';
    securityChecks: {
      cvcCheck?: 'pass' | 'fail' | 'unavailable';
      avsCheck?: 'pass' | 'fail' | 'unavailable';
      threeDSecure?: 'authenticated' | 'not_authenticated' | 'unavailable';
    };
  };
  
  // Split payments (if multiple parties)
  splits: {
    recipientId: mongoose.Types.ObjectId;
    recipientType: 'professional' | 'clinic' | 'platform';
    amount: number;
    percentage: number;
    status: 'pending' | 'completed' | 'failed';
  }[];
  
  // Customer information snapshot
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  
  // Receipt and documentation
  receipt: {
    receiptNumber?: string;
    receiptUrl?: string;
    emailSent: boolean;
    emailSentAt?: Date;
  };
  
  // Metadata and notes
  metadata: {
    source: 'appointment' | 'invoice' | 'subscription' | 'manual';
    channel: 'online' | 'app' | 'pos' | 'phone' | 'admin';
    campaign?: string;
    couponCode?: string;
    notes?: string;
  };
  
  // Audit trail
  auditLog: {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedAt: Date;
    details?: string;
    ipAddress?: string;
  }[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  refund(amount: number, reason: string): Promise<this>;
  markAsReconciled(reconciledBy: mongoose.Types.ObjectId, bankReference?: string): Promise<this>;
  addAuditLog(action: string, performedBy: mongoose.Types.ObjectId, details?: string): this;
  generateReceiptNumber(): string;
  calculateFees(): this;
  softDelete(): Promise<this>;
}

const SecurityChecksSchema = new Schema({
  cvcCheck: {
    type: String,
    enum: ['pass', 'fail', 'unavailable'],
  },
  avsCheck: {
    type: String,
    enum: ['pass', 'fail', 'unavailable'],
  },
  threeDSecure: {
    type: String,
    enum: ['authenticated', 'not_authenticated', 'unavailable'],
  },
}, { _id: false });

const PaymentDetailsSchema = new Schema({
  cardLast4: {
    type: String,
    trim: true,
    validate: {
      validator: (v: string) => !v || /^\d{4}$/.test(v),
      message: 'Card last 4 digits must be exactly 4 digits',
    },
  },
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unknown'],
    lowercase: true,
  },
  cardCountry: {
    type: String,
    uppercase: true,
    length: 2,
  },
  bankAccount: {
    type: String,
    trim: true,
  },
  transferReference: {
    type: String,
    trim: true,
  },
  checkNumber: {
    type: String,
    trim: true,
  },
  bankName: {
    type: String,
    trim: true,
  },
  gatewayTransactionId: {
    type: String,
    trim: true,
  },
  gatewayReference: {
    type: String,
    trim: true,
  },
  gatewayFee: {
    type: Number,
    min: [0, 'Gateway fee cannot be negative'],
    default: 0,
  },
  insuranceProvider: {
    type: String,
    trim: true,
  },
  policyNumber: {
    type: String,
    trim: true,
  },
  claimNumber: {
    type: String,
    trim: true,
  },
  authorizationCode: {
    type: String,
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
}, { _id: false });

const FeesSchema = new Schema({
  gatewayFee: {
    type: Number,
    default: 0,
    min: [0, 'Gateway fee cannot be negative'],
  },
  processingFee: {
    type: Number,
    default: 0,
    min: [0, 'Processing fee cannot be negative'],
  },
  platformFee: {
    type: Number,
    default: 0,
    min: [0, 'Platform fee cannot be negative'],
  },
  totalFees: {
    type: Number,
    default: 0,
    min: [0, 'Total fees cannot be negative'],
  },
  netAmount: {
    type: Number,
    required: true,
    min: [0, 'Net amount cannot be negative'],
  },
}, { _id: false });

const RefundSchema = new Schema({
  refundId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Refund amount must be positive'],
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters'],
  },
  refundedAt: {
    type: Date,
    required: true,
  },
  refundMethod: {
    type: String,
    trim: true,
  },
  externalRefundId: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, { timestamps: false });

const ReconciliationSchema = new Schema({
  isReconciled: {
    type: Boolean,
    default: false,
  },
  reconciledAt: {
    type: Date,
  },
  reconciledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  bankStatementDate: {
    type: Date,
  },
  bankReference: {
    type: String,
    trim: true,
  },
  discrepancyAmount: {
    type: Number,
    default: 0,
  },
  discrepancyNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Discrepancy notes cannot exceed 1000 characters'],
  },
}, { _id: false });

const SecuritySchema = new Schema({
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  fraudScore: {
    type: Number,
    min: [0, 'Fraud score cannot be negative'],
    max: [100, 'Fraud score cannot exceed 100'],
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  securityChecks: {
    type: SecurityChecksSchema,
    default: {},
  },
}, { _id: false });

const SplitSchema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'splits.recipientType',
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['professional', 'clinic', 'platform'],
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Split amount cannot be negative'],
  },
  percentage: {
    type: Number,
    required: true,
    min: [0, 'Split percentage cannot be negative'],
    max: [100, 'Split percentage cannot exceed 100%'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, { timestamps: false });

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
}, { _id: false });

const ReceiptSchema = new Schema({
  receiptNumber: {
    type: String,
    trim: true,
  },
  receiptUrl: {
    type: String,
    trim: true,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: {
    type: Date,
  },
}, { _id: false });

const MetadataSchema = new Schema({
  source: {
    type: String,
    enum: ['appointment', 'invoice', 'subscription', 'manual'],
    required: true,
  },
  channel: {
    type: String,
    enum: ['online', 'app', 'pos', 'phone', 'admin'],
    required: true,
  },
  campaign: {
    type: String,
    trim: true,
  },
  couponCode: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
}, { _id: false });

const AuditLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  performedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  details: {
    type: String,
    trim: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
}, { _id: false });

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    // Related entities
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      index: true,
    },
    
    // Payment identification
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    externalTransactionId: {
      type: String,
      trim: true,
      index: true,
    },
    
    // Payment details
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Payment amount must be positive'],
    },
    currency: {
      type: String,
      enum: ['EUR', 'USD', 'GBP'],
      default: 'EUR',
      uppercase: true,
    },
    
    // Payment method and processing
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'check', 'online', 'insurance', 'paypal', 'stripe'],
      required: true,
      index: true,
    },
    processor: {
      type: String,
      enum: ['stripe', 'paypal', 'redsys', 'bizum', 'internal'],
    },
    
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    
    // Dates
    paymentDate: {
      type: Date,
      required: true,
      index: true,
    },
    processedAt: {
      type: Date,
      index: true,
    },
    
    // Payment details
    details: {
      type: PaymentDetailsSchema,
      default: {},
    },
    
    // Fees
    fees: {
      type: FeesSchema,
      required: true,
    },
    
    // Refunds
    refunds: {
      type: [RefundSchema],
      default: [],
    },
    
    // Reconciliation
    reconciliation: {
      type: ReconciliationSchema,
      default: { isReconciled: false },
    },
    
    // Security
    security: {
      type: SecuritySchema,
      default: { riskLevel: 'low' },
    },
    
    // Splits
    splits: {
      type: [SplitSchema],
      default: [],
    },
    
    // Customer snapshot
    customer: {
      type: CustomerSchema,
      required: true,
    },
    
    // Receipt
    receipt: {
      type: ReceiptSchema,
      default: { emailSent: false },
    },
    
    // Metadata
    metadata: {
      type: MetadataSchema,
      required: true,
    },
    
    // Audit log
    auditLog: {
      type: [AuditLogSchema],
      default: [],
    },
    
    // Soft delete
    deletedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient queries
PaymentSchema.index({ patientId: 1, status: 1 });
PaymentSchema.index({ status: 1, paymentDate: -1 });
PaymentSchema.index({ method: 1, status: 1 });
PaymentSchema.index({ processor: 1, externalTransactionId: 1 });
PaymentSchema.index({ professionalId: 1, paymentDate: -1 });
PaymentSchema.index({ 'reconciliation.isReconciled': 1, paymentDate: 1 });
PaymentSchema.index({ createdAt: -1 });

// Text search index
PaymentSchema.index({
  paymentNumber: 'text',
  'customer.name': 'text',
  'customer.email': 'text',
  'details.reference': 'text',
});

// Pre-save middleware
PaymentSchema.pre('save', function(this: IPaymentDocument, next) {
  // Calculate fees if not already calculated
  if (this.isModified('amount') || this.isModified('method') || this.isModified('processor')) {
    this.calculateFees();
  }
  
  // Auto-generate payment number if new
  if (this.isNew && !this.paymentNumber) {
    this.paymentNumber = this.generateReceiptNumber();
  }
  
  // Set processed date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Generate receipt number if completed and none exists
  if (this.status === 'completed' && !this.receipt.receiptNumber) {
    this.receipt.receiptNumber = `REC-${this.paymentNumber}`;
  }
  
  next();
});

// Static methods
PaymentSchema.statics.generatePaymentNumber = async function() {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `PAY${currentYear}${currentMonth}`;
  
  const lastPayment = await this.findOne(
    { paymentNumber: new RegExp(`^${prefix}`) },
    {},
    { sort: { paymentNumber: -1 } }
  );
  
  let nextNumber = 1;
  if (lastPayment) {
    const match = lastPayment.paymentNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

PaymentSchema.statics.findByPatient = function(patientId: mongoose.Types.ObjectId, limit?: number) {
  return this.find({
    patientId,
    deletedAt: null,
  })
    .sort({ paymentDate: -1 })
    .limit(limit || 20);
};

PaymentSchema.statics.findByStatus = function(status: string | string[], limit?: number) {
  const statuses = Array.isArray(status) ? status : [status];
  
  return this.find({
    status: { $in: statuses },
    deletedAt: null,
  })
    .sort({ paymentDate: -1 })
    .limit(limit || 50);
};

PaymentSchema.statics.findUnreconciled = function() {
  return this.find({
    'reconciliation.isReconciled': false,
    status: 'completed',
    deletedAt: null,
  }).sort({ paymentDate: 1 });
};

PaymentSchema.statics.getRevenueByPeriod = function(
  startDate?: Date,
  endDate?: Date,
  professionalId?: mongoose.Types.ObjectId
) {
  const matchStage: any = {
    status: 'completed',
    deletedAt: null,
  };
  
  if (startDate && endDate) {
    matchStage.paymentDate = { $gte: startDate, $lte: endDate };
  }
  
  if (professionalId) {
    matchStage.professionalId = professionalId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          currency: '$currency',
          method: '$method',
        },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fees.totalFees' },
        netAmount: { $sum: '$fees.netAmount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.currency',
        methods: {
          $push: {
            method: '$_id.method',
            totalAmount: '$totalAmount',
            totalFees: '$totalFees',
            netAmount: '$netAmount',
            count: '$count',
          },
        },
        totalAmount: { $sum: '$totalAmount' },
        totalFees: { $sum: '$totalFees' },
        netAmount: { $sum: '$netAmount' },
        totalCount: { $sum: '$count' },
      },
    },
  ]);
};

// Instance methods
PaymentSchema.methods.refund = function(amount: number, reason: string) {
  const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  this.refunds.push({
    refundId,
    amount,
    reason,
    refundedAt: new Date(),
    status: 'pending',
  });
  
  const totalRefunded = this.refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0);
  
  if (totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else if (totalRefunded > 0) {
    this.status = 'partially_refunded';
  }
  
  this.addAuditLog('refund_initiated', this.patientId, `Refund of ${amount} ${this.currency} for: ${reason}`);
  
  return this.save();
};

PaymentSchema.methods.markAsReconciled = function(
  reconciledBy: mongoose.Types.ObjectId,
  bankReference?: string
) {
  this.reconciliation.isReconciled = true;
  this.reconciliation.reconciledAt = new Date();
  this.reconciliation.reconciledBy = reconciledBy;
  this.reconciliation.bankReference = bankReference;
  
  this.addAuditLog('reconciled', reconciledBy, `Payment reconciled with bank reference: ${bankReference}`);
  
  return this.save();
};

PaymentSchema.methods.addAuditLog = function(
  action: string,
  performedBy: mongoose.Types.ObjectId,
  details?: string
) {
  this.auditLog.push({
    action,
    performedBy,
    performedAt: new Date(),
    details,
  });
  
  return this;
};

PaymentSchema.methods.generateReceiptNumber = function(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `REC-${timestamp}-${random}`.toUpperCase();
};

PaymentSchema.methods.calculateFees = function() {
  let gatewayFee = 0;
  let processingFee = 0;
  let platformFee = 0;
  
  // Calculate fees based on method and processor
  switch (this.method) {
    case 'card':
      if (this.processor === 'stripe') {
        gatewayFee = Math.round((this.amount * 0.014 + 0.25) * 100) / 100; // 1.4% + 0.25€
      } else if (this.processor === 'redsys') {
        gatewayFee = Math.round((this.amount * 0.01) * 100) / 100; // 1%
      }
      break;
    
    case 'paypal':
      gatewayFee = Math.round((this.amount * 0.034 + 0.35) * 100) / 100; // 3.4% + 0.35€
      break;
    
    case 'transfer':
      processingFee = 0.5; // Fixed fee for bank transfers
      break;
    
    case 'cash':
    case 'check':
      // No fees for cash/check
      break;
  }
  
  // Platform fee (if applicable)
  if (this.splits.length > 0) {
    platformFee = Math.round((this.amount * 0.005) * 100) / 100; // 0.5% platform fee
  }
  
  const totalFees = gatewayFee + processingFee + platformFee;
  const netAmount = this.amount - totalFees;
  
  this.fees = {
    gatewayFee: Math.round(gatewayFee * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
  
  return this;
};

PaymentSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.addAuditLog('deleted', this.patientId, 'Payment soft deleted');
  return this.save();
};

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
export default Payment;
