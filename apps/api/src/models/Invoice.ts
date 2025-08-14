import mongoose, { Document, Schema } from 'mongoose';
import { IInvoice } from '@apsicologia/shared/types';

export interface IInvoiceDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Invoice identification
  invoiceNumber: string;
  series: string;
  
  // Related entities
  patientId: mongoose.Types.ObjectId;
  professionalId?: mongoose.Types.ObjectId;
  appointmentIds: mongoose.Types.ObjectId[];
  
  // Invoice dates
  issueDate: Date;
  dueDate: Date;
  serviceDate: Date;
  
  // Status and workflow
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded';
  
  // Customer information (snapshot for compliance)
  customer: {
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      state?: string;
      country: string;
    };
  };
  
  // Invoice items/services
  items: {
    serviceId: mongoose.Types.ObjectId;
    appointmentId?: mongoose.Types.ObjectId;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: {
      amount: number;
      percentage: number;
      reason?: string;
    };
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    
    // Service details snapshot
    serviceDetails: {
      name: string;
      duration: number;
      date: Date;
      professionalName: string;
    };
  }[];
  
  // Financial totals
  totals: {
    subtotal: number;
    totalDiscount: number;
    subtotalAfterDiscount: number;
    totalTax: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    currency: string;
  };
  
  // Tax information
  taxes: {
    name: string;
    rate: number;
    amount: number;
    taxableAmount: number;
  }[];
  
  // Payment information
  payment: {
    method?: 'cash' | 'card' | 'transfer' | 'check' | 'online' | 'insurance';
    reference?: string;
    paidAt?: Date;
    paidAmount?: number;
    partialPayments: {
      amount: number;
      method: string;
      reference?: string;
      paidAt: Date;
      notes?: string;
    }[];
  };
  
  // Insurance and third-party billing
  insurance?: {
    providerId: string;
    providerName: string;
    policyNumber: string;
    groupNumber?: string;
    coveragePercentage: number;
    copayAmount: number;
    deductibleAmount: number;
    authorizationNumber?: string;
    claimedAmount: number;
    approvedAmount?: number;
    claimStatus: 'pending' | 'approved' | 'denied' | 'partial';
    claimDate?: Date;
    claimReference?: string;
  };
  
  // Notes and communication
  notes?: {
    internal?: string;
    customer?: string;
    payment?: string;
    insurance?: string;
  };
  
  // PDF and document management
  document: {
    pdfUrl?: string;
    pdfGeneratedAt?: Date;
    templateId?: string;
    isGenerated: boolean;
  };
  
  // Communication history
  communications: {
    type: 'sent' | 'viewed' | 'reminder' | 'payment_request';
    method: 'email' | 'sms' | 'postal' | 'portal';
    sentAt: Date;
    sentTo: string;
    subject?: string;
    status: 'sent' | 'delivered' | 'opened' | 'bounced' | 'failed';
    response?: string;
  }[];
  
  // Reminders and follow-up
  reminders: {
    scheduledFor: Date;
    sent: boolean;
    sentAt?: Date;
    reminderNumber: number;
    method: 'email' | 'sms';
    template?: string;
  }[];
  
  // Legal and compliance
  legal: {
    vatNumber?: string;
    vatRate?: number;
    vatAmount?: number;
    retentionRate?: number;
    retentionAmount?: number;
    fiscalYear: number;
    legalText?: string;
    complianceNotes?: string;
  };
  
  // Recurring billing (if applicable)
  recurring?: {
    isRecurring: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    parentInvoiceId?: mongoose.Types.ObjectId;
    nextBillingDate?: Date;
    endDate?: Date;
    occurrences?: number;
    currentOccurrence?: number;
  };
  
  // Cancellation and refunds
  cancellation?: {
    cancelledAt: Date;
    cancelledBy: mongoose.Types.ObjectId;
    reason: string;
    refundAmount?: number;
    refundProcessed: boolean;
    refundDate?: Date;
    refundReference?: string;
  };
  
  // Audit and metadata
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  version: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  calculateTotals(): this;
  addPayment(amount: number, method: string, reference?: string, notes?: string): Promise<this>;
  markAsSent(sentTo: string, method?: 'email' | 'sms' | 'postal'): Promise<this>;
  markAsViewed(viewedBy?: string): Promise<this>;
  cancel(cancelledBy: mongoose.Types.ObjectId, reason: string, refundAmount?: number): Promise<this>;
  scheduleReminder(daysFromNow?: number, method?: 'email' | 'sms', template?: string): Promise<this>;
  duplicate(newIssueDate?: Date, newDueDate?: Date): Promise<IInvoiceDocument>;
  softDelete(): Promise<this>;
}

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Spain',
  },
}, { _id: false });

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
  taxId: {
    type: String,
    trim: true,
    uppercase: true,
  },
  address: {
    type: AddressSchema,
    required: true,
  },
}, { _id: false });

const DiscountSchema = new Schema({
  amount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative'],
  },
  percentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%'],
  },
  reason: {
    type: String,
    trim: true,
  },
}, { _id: false });

const ServiceDetailsSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  professionalName: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const InvoiceItemSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be positive'],
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative'],
  },
  discount: {
    type: DiscountSchema,
    default: { amount: 0, percentage: 0 },
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
  },
  taxRate: {
    type: Number,
    default: 21, // Default Spanish VAT rate
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
  },
  taxAmount: {
    type: Number,
    required: true,
    min: [0, 'Tax amount cannot be negative'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  serviceDetails: {
    type: ServiceDetailsSchema,
    required: true,
  },
}, { timestamps: false });

const TotalsSchema = new Schema({
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Total discount cannot be negative'],
  },
  subtotalAfterDiscount: {
    type: Number,
    required: true,
    min: [0, 'Subtotal after discount cannot be negative'],
  },
  totalTax: {
    type: Number,
    required: true,
    min: [0, 'Total tax cannot be negative'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative'],
  },
  amountDue: {
    type: Number,
    required: true,
    min: [0, 'Amount due cannot be negative'],
  },
  currency: {
    type: String,
    enum: ['EUR', 'USD', 'GBP'],
    default: 'EUR',
    uppercase: true,
  },
}, { _id: false });

const TaxSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rate: {
    type: Number,
    required: true,
    min: [0, 'Tax rate cannot be negative'],
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Tax amount cannot be negative'],
  },
  taxableAmount: {
    type: Number,
    required: true,
    min: [0, 'Taxable amount cannot be negative'],
  },
}, { _id: false });

const PartialPaymentSchema = new Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Payment amount must be positive'],
  },
  method: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'transfer', 'check', 'online', 'insurance'],
  },
  reference: {
    type: String,
    trim: true,
  },
  paidAt: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: false });

const CommunicationSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['sent', 'viewed', 'reminder', 'payment_request'],
  },
  method: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'postal', 'portal'],
  },
  sentAt: {
    type: Date,
    required: true,
  },
  sentTo: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'bounced', 'failed'],
    default: 'sent',
  },
  response: {
    type: String,
    trim: true,
  },
}, { timestamps: false });

const ReminderSchema = new Schema({
  scheduledFor: {
    type: Date,
    required: true,
  },
  sent: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
  },
  reminderNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  method: {
    type: String,
    enum: ['email', 'sms'],
    default: 'email',
  },
  template: {
    type: String,
    trim: true,
  },
}, { timestamps: false });

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    // Invoice identification
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    series: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: 'FAC',
      index: true,
    },
    
    // Related entities
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
    appointmentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Appointment',
      default: [],
      index: true,
    },
    
    // Invoice dates
    issueDate: {
      type: Date,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    
    // Status and workflow
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'],
      default: 'draft',
      index: true,
    },
    
    // Customer information
    customer: {
      type: CustomerSchema,
      required: true,
    },
    
    // Invoice items
    items: {
      type: [InvoiceItemSchema],
      required: true,
      validate: {
        validator: (items: any[]) => items.length > 0,
        message: 'Invoice must have at least one item',
      },
    },
    
    // Financial totals
    totals: {
      type: TotalsSchema,
      required: true,
    },
    
    // Tax information
    taxes: {
      type: [TaxSchema],
      default: [],
    },
    
    // Payment information
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'check', 'online', 'insurance'],
      },
      reference: {
        type: String,
        trim: true,
      },
      paidAt: {
        type: Date,
      },
      paidAmount: {
        type: Number,
        min: [0, 'Paid amount cannot be negative'],
      },
      partialPayments: {
        type: [PartialPaymentSchema],
        default: [],
      },
    },
    
    // Insurance information
    insurance: {
      providerId: {
        type: String,
        trim: true,
      },
      providerName: {
        type: String,
        trim: true,
      },
      policyNumber: {
        type: String,
        trim: true,
      },
      groupNumber: {
        type: String,
        trim: true,
      },
      coveragePercentage: {
        type: Number,
        min: [0, 'Coverage percentage cannot be negative'],
        max: [100, 'Coverage percentage cannot exceed 100%'],
      },
      copayAmount: {
        type: Number,
        min: [0, 'Copay amount cannot be negative'],
      },
      deductibleAmount: {
        type: Number,
        min: [0, 'Deductible amount cannot be negative'],
      },
      authorizationNumber: {
        type: String,
        trim: true,
      },
      claimedAmount: {
        type: Number,
        min: [0, 'Claimed amount cannot be negative'],
      },
      approvedAmount: {
        type: Number,
        min: [0, 'Approved amount cannot be negative'],
      },
      claimStatus: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'partial'],
        default: 'pending',
      },
      claimDate: {
        type: Date,
      },
      claimReference: {
        type: String,
        trim: true,
      },
    },
    
    // Notes
    notes: {
      internal: {
        type: String,
        trim: true,
        maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
      },
      customer: {
        type: String,
        trim: true,
        maxlength: [1000, 'Customer notes cannot exceed 1000 characters'],
      },
      payment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Payment notes cannot exceed 1000 characters'],
      },
      insurance: {
        type: String,
        trim: true,
        maxlength: [1000, 'Insurance notes cannot exceed 1000 characters'],
      },
    },
    
    // PDF document
    document: {
      pdfUrl: {
        type: String,
        trim: true,
      },
      pdfGeneratedAt: {
        type: Date,
      },
      templateId: {
        type: String,
        trim: true,
      },
      isGenerated: {
        type: Boolean,
        default: false,
      },
    },
    
    // Communications
    communications: {
      type: [CommunicationSchema],
      default: [],
    },
    
    // Reminders
    reminders: {
      type: [ReminderSchema],
      default: [],
    },
    
    // Legal and compliance
    legal: {
      vatNumber: {
        type: String,
        trim: true,
      },
      vatRate: {
        type: Number,
        min: [0, 'VAT rate cannot be negative'],
      },
      vatAmount: {
        type: Number,
        min: [0, 'VAT amount cannot be negative'],
      },
      retentionRate: {
        type: Number,
        min: [0, 'Retention rate cannot be negative'],
      },
      retentionAmount: {
        type: Number,
        min: [0, 'Retention amount cannot be negative'],
      },
      fiscalYear: {
        type: Number,
        required: true,
        default: () => new Date().getFullYear(),
      },
      legalText: {
        type: String,
        trim: true,
      },
      complianceNotes: {
        type: String,
        trim: true,
      },
    },
    
    // Recurring billing
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      },
      parentInvoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
      },
      nextBillingDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      occurrences: {
        type: Number,
        min: [1, 'Occurrences must be at least 1'],
      },
      currentOccurrence: {
        type: Number,
        default: 1,
        min: [1, 'Current occurrence must be at least 1'],
      },
    },
    
    // Cancellation
    cancellation: {
      cancelledAt: { type: Date },
      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: {
        type: String,
        trim: true,
      },
      refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
      },
      refundProcessed: {
        type: Boolean,
        default: false,
      },
      refundDate: {
        type: Date,
      },
      refundReference: {
        type: String,
        trim: true,
      },
    },
    
    // Audit
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
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
InvoiceSchema.index({ patientId: 1, status: 1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ issueDate: 1, status: 1 });
InvoiceSchema.index({ professionalId: 1, issueDate: -1 });
InvoiceSchema.index({ series: 1, invoiceNumber: 1 });
InvoiceSchema.index({ 'totals.currency': 1, issueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Text search index
InvoiceSchema.index({
  invoiceNumber: 'text',
  'customer.name': 'text',
  'customer.email': 'text',
  'items.description': 'text',
});

// Pre-save middleware
InvoiceSchema.pre('save', function(this: IInvoiceDocument, next) {
  // Auto-calculate totals if not provided or if items changed
  if (this.isModified('items')) {
    this.calculateTotals();
  }
  
  // Update version on modifications
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.lastModifiedBy = this.lastModifiedBy || this.createdBy;
  }
  
  // Set due date if not provided (default: 30 days from issue date)
  if (!this.dueDate && this.issueDate) {
    this.dueDate = new Date(this.issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Update payment status based on amounts
  if (this.totals.amountPaid >= this.totals.total) {
    this.status = 'paid';
  } else if (this.totals.amountPaid > 0) {
    this.status = 'partially_paid';
  }
  
  next();
});

// Static methods
InvoiceSchema.statics.generateInvoiceNumber = async function(series: string = 'FAC') {
  const currentYear = new Date().getFullYear();
  const lastInvoice = await this.findOne(
    { series, 'legal.fiscalYear': currentYear },
    {},
    { sort: { invoiceNumber: -1 } }
  );
  
  let nextNumber = 1;
  if (lastInvoice) {
    const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `${series}${currentYear}${nextNumber.toString().padStart(4, '0')}`;
};

InvoiceSchema.statics.findByPatient = function(patientId: mongoose.Types.ObjectId, limit?: number) {
  return this.find({
    patientId,
    deletedAt: null,
  })
    .sort({ issueDate: -1 })
    .limit(limit || 20);
};

InvoiceSchema.statics.findByStatus = function(status: string | string[], limit?: number) {
  const statuses = Array.isArray(status) ? status : [status];
  
  return this.find({
    status: { $in: statuses },
    deletedAt: null,
  })
    .sort({ issueDate: -1 })
    .limit(limit || 50);
};

InvoiceSchema.statics.findOverdue = function() {
  const now = new Date();
  
  return this.find({
    dueDate: { $lt: now },
    status: { $in: ['sent', 'viewed', 'partially_paid'] },
    deletedAt: null,
  }).sort({ dueDate: 1 });
};

InvoiceSchema.statics.getRevenueSummary = function(
  startDate?: Date,
  endDate?: Date,
  professionalId?: mongoose.Types.ObjectId
) {
  const matchStage: any = {
    status: { $in: ['paid', 'partially_paid'] },
    deletedAt: null,
  };
  
  if (startDate && endDate) {
    matchStage.issueDate = { $gte: startDate, $lte: endDate };
  }
  
  if (professionalId) {
    matchStage.professionalId = professionalId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$totals.currency',
        totalRevenue: { $sum: '$totals.amountPaid' },
        totalInvoices: { $sum: 1 },
        averageInvoiceValue: { $avg: '$totals.total' },
        totalTax: { $sum: '$totals.totalTax' },
      },
    },
  ]);
};

// Instance methods
InvoiceSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  const taxBreakdown: { [key: string]: { name: string; rate: number; amount: number; taxableAmount: number } } = {};
  
  this.items.forEach((item: any) => {
    // Calculate item subtotal
    item.subtotal = item.quantity * item.unitPrice;
    
    // Apply discount
    let discountAmount = 0;
    if (item.discount.percentage > 0) {
      discountAmount = (item.subtotal * item.discount.percentage) / 100;
    } else if (item.discount.amount > 0) {
      discountAmount = Math.min(item.discount.amount, item.subtotal);
    }
    
    item.discount.amount = discountAmount;
    const subtotalAfterDiscount = item.subtotal - discountAmount;
    
    // Calculate tax
    item.taxAmount = (subtotalAfterDiscount * item.taxRate) / 100;
    item.total = subtotalAfterDiscount + item.taxAmount;
    
    // Accumulate totals
    subtotal += item.subtotal;
    totalDiscount += discountAmount;
    totalTax += item.taxAmount;
    
    // Group taxes
    const taxKey = `${item.taxRate}`;
    if (!taxBreakdown[taxKey]) {
      taxBreakdown[taxKey] = {
        name: `VAT ${item.taxRate}%`,
        rate: item.taxRate,
        amount: 0,
        taxableAmount: 0,
      };
    }
    taxBreakdown[taxKey].amount += item.taxAmount;
    taxBreakdown[taxKey].taxableAmount += subtotalAfterDiscount;
  });
  
  // Update totals
  this.totals.subtotal = Math.round(subtotal * 100) / 100;
  this.totals.totalDiscount = Math.round(totalDiscount * 100) / 100;
  this.totals.subtotalAfterDiscount = Math.round((subtotal - totalDiscount) * 100) / 100;
  this.totals.totalTax = Math.round(totalTax * 100) / 100;
  this.totals.total = Math.round((subtotal - totalDiscount + totalTax) * 100) / 100;
  this.totals.amountDue = Math.max(0, this.totals.total - (this.totals.amountPaid || 0));
  
  // Update tax breakdown
  this.taxes = Object.values(taxBreakdown);
  
  return this;
};

InvoiceSchema.methods.addPayment = function(
  amount: number,
  method: string,
  reference?: string,
  notes?: string
) {
  const payment = {
    amount,
    method,
    reference,
    paidAt: new Date(),
    notes,
  };
  
  this.payment.partialPayments.push(payment);
  this.totals.amountPaid = (this.totals.amountPaid || 0) + amount;
  this.totals.amountDue = Math.max(0, this.totals.total - this.totals.amountPaid);
  
  // Update main payment info if this is the first/largest payment
  if (!this.payment.paidAt || amount > (this.payment.paidAmount || 0)) {
    this.payment.method = method;
    this.payment.reference = reference;
    this.payment.paidAt = new Date();
    this.payment.paidAmount = amount;
  }
  
  return this.save();
};

InvoiceSchema.methods.markAsSent = function(sentTo: string, method: 'email' | 'sms' | 'postal' = 'email') {
  this.status = 'sent';
  this.communications.push({
    type: 'sent',
    method,
    sentAt: new Date(),
    sentTo,
    status: 'sent',
  });
  return this.save();
};

InvoiceSchema.methods.markAsViewed = function(viewedBy?: string) {
  if (this.status === 'sent') {
    this.status = 'viewed';
  }
  
  if (viewedBy) {
    this.communications.push({
      type: 'viewed',
      method: 'portal',
      sentAt: new Date(),
      sentTo: viewedBy,
      status: 'delivered',
    });
  }
  
  return this.save();
};

InvoiceSchema.methods.cancel = function(
  cancelledBy: mongoose.Types.ObjectId,
  reason: string,
  refundAmount?: number
) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason,
    refundAmount: refundAmount || 0,
    refundProcessed: false,
  };
  return this.save();
};

InvoiceSchema.methods.scheduleReminder = function(
  daysFromNow: number = 7,
  method: 'email' | 'sms' = 'email',
  template?: string
) {
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + daysFromNow);
  
  const reminderNumber = this.reminders.length + 1;
  
  this.reminders.push({
    scheduledFor,
    sent: false,
    reminderNumber,
    method,
    template,
  });
  
  return this.save();
};

InvoiceSchema.methods.duplicate = function(
  newIssueDate?: Date,
  newDueDate?: Date
): Promise<IInvoiceDocument> {
  const invoiceData = this.toObject();
  
  // Remove unique fields
  delete invoiceData._id;
  delete invoiceData.invoiceNumber;
  delete invoiceData.createdAt;
  delete invoiceData.updatedAt;
  delete invoiceData.document;
  delete invoiceData.communications;
  delete invoiceData.reminders;
  delete invoiceData.payment;
  delete invoiceData.cancellation;
  
  // Set new dates
  invoiceData.issueDate = newIssueDate || new Date();
  invoiceData.dueDate = newDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  invoiceData.status = 'draft';
  invoiceData.version = 1;
  
  // Reset financial data
  invoiceData.totals.amountPaid = 0;
  invoiceData.totals.amountDue = invoiceData.totals.total;
  
  return new (this.constructor as any)(invoiceData);
};

InvoiceSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

export const Invoice = mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);
export default Invoice;
