import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Invoice } from '../models/Invoice.js';
import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Professional } from '../models/Professional.js';
import { Service } from '../models/Service.js';
import { Payment } from '../models/Payment.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface StatsQuery {
  startDate?: string;
  endDate?: string;
  professionalId?: string;
  serviceId?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  timezone?: string;
}

export class StatsController {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        startDate,
        endDate,
        professionalId,
        serviceId,
        period = 'month',
        timezone = 'Europe/Madrid'
      } = req.query as StatsQuery;

      // Only admin, reception, and professionals can see stats
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions for statistics',
        });
      }

      // Build base filter for professional scope
      const baseFilter: any = {};
      if (authUser.role === 'professional') {
        baseFilter.professionalId = new Types.ObjectId(authUser.professionalId);
      } else if (professionalId) {
        baseFilter.professionalId = new Types.ObjectId(professionalId);
      }

      // Build date filter
      const dateFilter: any = {};
      const now = new Date();
      let defaultStartDate: Date;

      switch (period) {
        case 'day':
          defaultStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          defaultStartDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
          break;
        case 'month':
          defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          defaultStartDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case 'year':
          defaultStartDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      if (startDate || endDate) {
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
      } else {
        dateFilter.$gte = defaultStartDate;
        dateFilter.$lte = now;
      }

      // Execute parallel aggregations for different metrics
      const [
        appointmentStats,
        revenueStats,
        patientStats,
        professionalStats,
        serviceStats,
        trendsData,
        upcomingAppointments,
        recentActivities,
      ] = await Promise.all([
        // Appointment Statistics
        Appointment.aggregate([
          {
            $match: {
              ...baseFilter,
              start: dateFilter,
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
              noShows: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } },
              confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
              avgDuration: { $avg: '$durationMinutes' },
            },
          },
        ]),

        // Revenue Statistics
        Invoice.aggregate([
          {
            $match: {
              ...baseFilter,
              issueDate: dateFilter,
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: '$totals.currency',
              totalRevenue: { $sum: '$totals.total' },
              paidRevenue: { 
                $sum: { 
                  $cond: [{ $eq: ['$status', 'paid'] }, '$totals.total', 0] 
                }
              },
              pendingRevenue: { 
                $sum: { 
                  $cond: [
                    { $in: ['$status', ['sent', 'viewed', 'partially_paid']] }, 
                    '$totals.total', 
                    0
                  ] 
                }
              },
              invoiceCount: { $sum: 1 },
              avgInvoiceValue: { $avg: '$totals.total' },
              totalTax: { $sum: '$totals.totalTax' },
              overdueCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $lt: ['$dueDate', now] },
                        { $in: ['$status', ['sent', 'viewed', 'partially_paid']] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
            },
          },
        ]),

        // Patient Statistics
        Patient.aggregate([
          {
            $match: {
              createdAt: dateFilter,
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: null,
              newPatients: { $sum: 1 },
              activePatients: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              inactivePatients: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
              avgAge: { 
                $avg: {
                  $divide: [
                    { $subtract: [new Date(), '$personalInfo.birthDate'] },
                    1000 * 60 * 60 * 24 * 365.25
                  ]
                }
              },
              lowRisk: { $sum: { $cond: [{ $eq: ['$clinicalInfo.riskLevel', 'low'] }, 1, 0] } },
              mediumRisk: { $sum: { $cond: [{ $eq: ['$clinicalInfo.riskLevel', 'medium'] }, 1, 0] } },
              highRisk: { $sum: { $cond: [{ $eq: ['$clinicalInfo.riskLevel', 'high'] }, 1, 0] } },
            },
          },
        ]),

        // Professional Statistics (if admin/reception)
        authUser.role !== 'professional' ? Professional.aggregate([
          {
            $match: { deletedAt: null },
          },
          {
            $lookup: {
              from: 'appointments',
              let: { professionalId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$professionalId', '$$professionalId'] },
                    start: dateFilter,
                    deletedAt: null,
                  },
                },
                {
                  $group: {
                    _id: null,
                    appointmentCount: { $sum: 1 },
                    completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                  },
                },
              ],
              as: 'appointmentData',
            },
          },
          {
            $project: {
              name: 1,
              specialties: 1,
              status: 1,
              appointmentCount: { $arrayElemAt: ['$appointmentData.appointmentCount', 0] },
              completedCount: { $arrayElemAt: ['$appointmentData.completedCount', 0] },
              completionRate: {
                $cond: [
                  { $gt: [{ $arrayElemAt: ['$appointmentData.appointmentCount', 0] }, 0] },
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $arrayElemAt: ['$appointmentData.completedCount', 0] },
                          { $arrayElemAt: ['$appointmentData.appointmentCount', 0] }
                        ]
                      },
                      100
                    ]
                  },
                  0
                ]
              },
            },
          },
          { $sort: { appointmentCount: -1 } },
          { $limit: 10 },
        ]) : [],

        // Service Statistics
        Service.aggregate([
          {
            $lookup: {
              from: 'appointments',
              let: { serviceId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$serviceId', '$$serviceId'] },
                    start: dateFilter,
                    ...baseFilter,
                    deletedAt: null,
                  },
                },
                {
                  $group: {
                    _id: null,
                    bookings: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    revenue: { $sum: '$fees.total' },
                  },
                },
              ],
              as: 'stats',
            },
          },
          {
            $project: {
              name: 1,
              price: 1,
              durationMinutes: 1,
              category: 1,
              bookings: { $arrayElemAt: ['$stats.bookings', 0] },
              completed: { $arrayElemAt: ['$stats.completed', 0] },
              revenue: { $arrayElemAt: ['$stats.revenue', 0] },
            },
          },
          { $match: { bookings: { $gt: 0 } } },
          { $sort: { bookings: -1 } },
          { $limit: 10 },
        ]),

        // Trends Data (daily/weekly/monthly based on period)
        Appointment.aggregate([
          {
            $match: {
              ...baseFilter,
              start: dateFilter,
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: period === 'day' ? '%Y-%m-%d-%H' : 
                         period === 'week' ? '%Y-%U' :
                         period === 'month' ? '%Y-%m-%d' : 
                         period === 'quarter' ? '%Y-%m' :
                         '%Y-%m',
                  date: '$start',
                  timezone: timezone,
                },
              },
              appointments: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              revenue: { $sum: '$fees.total' },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Upcoming Appointments (next 7 days)
        Appointment.find({
          ...baseFilter,
          start: {
            $gte: now,
            $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          deletedAt: null,
        })
          .populate('patientId', 'personalInfo')
          .populate('professionalId', 'name')
          .populate('serviceId', 'name durationMinutes')
          .sort({ start: 1 })
          .limit(10),

        // Recent Activities (audit logs)
        AuditLog.find({
          business: { clinicalRelevant: true },
          timestamp: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        })
          .sort({ timestamp: -1 })
          .limit(20),
      ]);

      // Calculate KPIs and format response
      const appointmentData = appointmentStats[0] || {
        total: 0, completed: 0, cancelled: 0, noShows: 0, confirmed: 0, pending: 0, avgDuration: 0
      };

      const revenueData = revenueStats.reduce((acc, curr) => {
        acc[curr._id] = {
          totalRevenue: curr.totalRevenue,
          paidRevenue: curr.paidRevenue,
          pendingRevenue: curr.pendingRevenue,
          invoiceCount: curr.invoiceCount,
          avgInvoiceValue: curr.avgInvoiceValue,
          totalTax: curr.totalTax,
          overdueCount: curr.overdueCount,
        };
        return acc;
      }, {} as any);

      const patientData = patientStats[0] || {
        newPatients: 0, activePatients: 0, inactivePatients: 0, avgAge: 0,
        lowRisk: 0, mediumRisk: 0, highRisk: 0
      };

      // Create riskDistribution object for response
      const riskDistribution = {
        low: patientData.lowRisk || 0,
        medium: patientData.mediumRisk || 0,
        high: patientData.highRisk || 0
      };

      // Calculate key performance indicators
      const kpis = {
        // Appointment KPIs
        totalAppointments: appointmentData.total,
        completionRate: appointmentData.total > 0 ? (appointmentData.completed / appointmentData.total) * 100 : 0,
        cancellationRate: appointmentData.total > 0 ? (appointmentData.cancelled / appointmentData.total) * 100 : 0,
        noShowRate: appointmentData.total > 0 ? (appointmentData.noShows / appointmentData.total) * 100 : 0,
        avgSessionDuration: Math.round(appointmentData.avgDuration || 0),

        // Revenue KPIs (EUR as primary currency)
        totalRevenue: revenueData.EUR?.totalRevenue || 0,
        paidRevenue: revenueData.EUR?.paidRevenue || 0,
        pendingRevenue: revenueData.EUR?.pendingRevenue || 0,
        collectionRate: revenueData.EUR?.totalRevenue > 0 ? 
          (revenueData.EUR?.paidRevenue / revenueData.EUR?.totalRevenue) * 100 : 0,
        avgInvoiceValue: revenueData.EUR?.avgInvoiceValue || 0,
        overdueInvoices: revenueData.EUR?.overdueCount || 0,

        // Patient KPIs
        newPatients: patientData.newPatients,
        activePatients: patientData.activePatients,
        patientRetention: patientData.activePatients + patientData.inactivePatients > 0 ?
          (patientData.activePatients / (patientData.activePatients + patientData.inactivePatients)) * 100 : 0,
        avgPatientAge: Math.round(patientData.avgAge || 0),

        // Efficiency KPIs
        utilizationRate: 0, // Would need available slots vs booked slots
        professionalCount: professionalStats.length,
        topPerformingProfessional: professionalStats[0]?.name || 'N/A',
      };

      const dashboardData = {
        period,
        dateRange: {
          start: startDate || defaultStartDate.toISOString(),
          end: endDate || now.toISOString(),
        },
        kpis,
        charts: {
          appointmentTrends: trendsData,
          revenueByService: serviceStats,
          professionalPerformance: professionalStats,
          patientRiskDistribution: riskDistribution,
        },
        tables: {
          upcomingAppointments,
          recentActivities: recentActivities.slice(0, 10),
          topServices: serviceStats.slice(0, 5),
        },
        summary: {
          appointments: appointmentData,
          revenue: revenueData,
          patients: patientData,
        },
      };

      res.status(200).json({
        success: true,
        data: dashboardData,
      });

    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      next(error);
    }
  }

  /**
   * Get appointment analytics
   */
  static async getAppointmentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        startDate,
        endDate,
        professionalId,
        serviceId,
        groupBy = 'day',
      } = req.query as StatsQuery & { groupBy?: 'hour' | 'day' | 'week' | 'month' };

      // Build filter
      const filter: any = { deletedAt: null };
      if (authUser.role === 'professional') {
        filter.professionalId = new Types.ObjectId(authUser.professionalId);
      } else if (professionalId) {
        filter.professionalId = new Types.ObjectId(professionalId);
      }
      if (serviceId) filter.serviceId = new Types.ObjectId(serviceId);

      if (startDate || endDate) {
        filter.start = {};
        if (startDate) filter.start.$gte = new Date(startDate);
        if (endDate) filter.start.$lte = new Date(endDate);
      }

      const groupFormat = {
        hour: '%Y-%m-%d-%H',
        day: '%Y-%m-%d',
        week: '%Y-%U',
        month: '%Y-%m',
      };

      const analytics = await Appointment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              period: {
                $dateToString: {
                  format: groupFormat[groupBy],
                  date: '$start',
                },
              },
              status: '$status',
            },
            count: { $sum: 1 },
            totalRevenue: { $sum: '$fees.total' },
            avgDuration: { $avg: '$durationMinutes' },
          },
        },
        {
          $group: {
            _id: '$_id.period',
            data: {
              $push: {
                status: '$_id.status',
                count: '$count',
                totalRevenue: '$totalRevenue',
                avgDuration: '$avgDuration',
              },
            },
            totalAppointments: { $sum: '$count' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get status distribution
      const statusDistribution = await Appointment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            percentage: { $sum: 1 }, // Will calculate percentage after
          },
        },
      ]);

      const totalForPercentage = statusDistribution.reduce((sum, item) => sum + item.count, 0);
      statusDistribution.forEach(item => {
        item.percentage = totalForPercentage > 0 ? (item.count / totalForPercentage) * 100 : 0;
      });

      res.status(200).json({
        success: true,
        data: {
          timeline: analytics,
          statusDistribution,
          groupBy,
        },
      });

    } catch (error) {
      logger.error('Get appointment analytics error:', error);
      next(error);
    }
  }

  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        startDate,
        endDate,
        professionalId,
        groupBy = 'month',
      } = req.query as StatsQuery & { groupBy?: 'day' | 'week' | 'month' | 'quarter' };

      // Only admin and reception can see full revenue analytics
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      const filter: any = { deletedAt: null };
      if (authUser.role === 'professional') {
        filter.professionalId = new Types.ObjectId(authUser.professionalId);
      } else if (professionalId) {
        filter.professionalId = new Types.ObjectId(professionalId);
      }

      if (startDate || endDate) {
        filter.issueDate = {};
        if (startDate) filter.issueDate.$gte = new Date(startDate);
        if (endDate) filter.issueDate.$lte = new Date(endDate);
      }

      const groupFormat = {
        day: '%Y-%m-%d',
        week: '%Y-%U',
        month: '%Y-%m',
        quarter: { $concat: [{ $toString: { $year: '$issueDate' } }, '-Q', { $toString: { $ceil: { $divide: [{ $month: '$issueDate' }, 3] } } }] },
      };

      const revenueAnalytics = await Invoice.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              period: typeof groupFormat[groupBy] === 'string' 
                ? { $dateToString: { format: groupFormat[groupBy], date: '$issueDate' } }
                : groupFormat[groupBy],
              currency: '$totals.currency',
            },
            totalRevenue: { $sum: '$totals.total' },
            paidRevenue: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totals.total', 0] } },
            pendingRevenue: { $sum: { $cond: [{ $in: ['$status', ['sent', 'viewed', 'partially_paid']] }, '$totals.total', 0] } },
            invoiceCount: { $sum: 1 },
            totalTax: { $sum: '$totals.totalTax' },
          },
        },
        {
          $group: {
            _id: '$_id.period',
            currencies: {
              $push: {
                currency: '$_id.currency',
                totalRevenue: '$totalRevenue',
                paidRevenue: '$paidRevenue',
                pendingRevenue: '$pendingRevenue',
                invoiceCount: '$invoiceCount',
                totalTax: '$totalTax',
              },
            },
            totalInvoices: { $sum: '$invoiceCount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get service breakdown
      const serviceBreakdown = await Invoice.aggregate([
        { $match: filter },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'services',
            localField: 'items.serviceId',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        {
          $group: {
            _id: {
              serviceId: '$service._id',
              serviceName: '$service.name',
              category: '$service.category',
            },
            totalRevenue: { $sum: '$items.total' },
            quantity: { $sum: '$items.quantity' },
            avgPrice: { $avg: '$items.unitPrice' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]);

      res.status(200).json({
        success: true,
        data: {
          timeline: revenueAnalytics,
          serviceBreakdown,
          groupBy,
        },
      });

    } catch (error) {
      logger.error('Get revenue analytics error:', error);
      next(error);
    }
  }

  /**
   * Get patient analytics
   */
  static async getPatientAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin, reception, and professionals can see patient analytics
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      const filter: any = { deletedAt: null };
      
      // Professional can only see their assigned patients
      if (authUser.role === 'professional') {
        filter['clinicalInfo.assignedProfessionals'] = new Types.ObjectId(authUser.professionalId);
      }

      const [
        ageDistribution,
        riskDistribution,
        statusDistribution,
        registrationTrends,
        appointmentFrequency,
      ] = await Promise.all([
        // Age Distribution
        Patient.aggregate([
          { $match: filter },
          {
            $project: {
              ageGroup: {
                $switch: {
                  branches: [
                    { case: { $lt: [{ $divide: [{ $subtract: [new Date(), '$personalInfo.birthDate'] }, 1000 * 60 * 60 * 24 * 365.25] }, 18] }, then: '0-17' },
                    { case: { $lt: [{ $divide: [{ $subtract: [new Date(), '$personalInfo.birthDate'] }, 1000 * 60 * 60 * 24 * 365.25] }, 25] }, then: '18-24' },
                    { case: { $lt: [{ $divide: [{ $subtract: [new Date(), '$personalInfo.birthDate'] }, 1000 * 60 * 60 * 24 * 365.25] }, 35] }, then: '25-34' },
                    { case: { $lt: [{ $divide: [{ $subtract: [new Date(), '$personalInfo.birthDate'] }, 1000 * 60 * 60 * 24 * 365.25] }, 50] }, then: '35-49' },
                    { case: { $lt: [{ $divide: [{ $subtract: [new Date(), '$personalInfo.birthDate'] }, 1000 * 60 * 60 * 24 * 365.25] }, 65] }, then: '50-64' },
                  ],
                  default: '65+'
                },
              },
            },
          },
          {
            $group: {
              _id: '$ageGroup',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Risk Distribution
        Patient.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$clinicalInfo.riskLevel',
              count: { $sum: 1 },
            },
          },
        ]),

        // Status Distribution
        Patient.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        // Registration Trends (last 12 months)
        Patient.aggregate([
          {
            $match: {
              ...filter,
              createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Appointment Frequency per Patient
        Patient.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: 'appointments',
              localField: '_id',
              foreignField: 'patientId',
              as: 'appointments',
            },
          },
          {
            $project: {
              appointmentCount: { $size: '$appointments' },
              lastAppointment: { $max: '$appointments.start' },
            },
          },
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$appointmentCount', 0] }, then: '0' },
                    { case: { $lt: ['$appointmentCount', 3] }, then: '1-2' },
                    { case: { $lt: ['$appointmentCount', 6] }, then: '3-5' },
                    { case: { $lt: ['$appointmentCount', 11] }, then: '6-10' },
                  ],
                  default: '11+'
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          ageDistribution,
          riskDistribution,
          statusDistribution,
          registrationTrends,
          appointmentFrequency,
        },
      });

    } catch (error) {
      logger.error('Get patient analytics error:', error);
      next(error);
    }
  }

  /**
   * Export statistics report
   */
  static async exportStatsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { format = 'json', ...queryParams } = req.query;

      // Only admin and reception can export
      if (!['admin', 'reception'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot export statistics',
        });
      }

      // Get comprehensive stats using the dashboard method
      req.query = queryParams;
      const mockRes = {
        status: (code: number) => ({
          json: (data: any) => ({ statusCode: code, data }),
        }),
      } as any;

      await StatsController.getDashboardStats(req, mockRes, next);
      const statsData = mockRes.status(200).json({ success: true }).data;

      if (format === 'csv') {
        // Generate CSV report
        const csvLines = [
          'Report Generated At,' + new Date().toISOString(),
          '',
          'KEY PERFORMANCE INDICATORS',
          'Metric,Value',
          `Total Appointments,${statsData.kpis.totalAppointments}`,
          `Completion Rate,${statsData.kpis.completionRate.toFixed(2)}%`,
          `Cancellation Rate,${statsData.kpis.cancellationRate.toFixed(2)}%`,
          `No-Show Rate,${statsData.kpis.noShowRate.toFixed(2)}%`,
          `Total Revenue,€${statsData.kpis.totalRevenue.toFixed(2)}`,
          `Collection Rate,${statsData.kpis.collectionRate.toFixed(2)}%`,
          `New Patients,${statsData.kpis.newPatients}`,
          `Active Patients,${statsData.kpis.activePatients}`,
          '',
          'TOP SERVICES',
          'Service,Bookings,Revenue',
          ...statsData.tables.topServices.map((service: any) => 
            `"${service.name}",${service.bookings},€${(service.revenue || 0).toFixed(2)}`
          ),
        ];

        const csvContent = csvLines.join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="statistics_report.csv"');
        res.status(200).send(csvContent);
      } else {
        // Return JSON export
        res.status(200).json({
          success: true,
          data: {
            report: statsData,
            exportedAt: new Date(),
            exportFormat: format,
          },
        });
      }

      // Log export
      await AuditLog.create({
        action: 'statistics_exported',
        entityType: 'stats',
        entityId: 'dashboard_export',
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: { format, queryParams },
        business: {
          clinicalRelevant: false,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'stats_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Export stats report error:', error);
      next(error);
    }
  }
}

export default StatsController;
