'use client';

import { Calendar, Users, Star, TrendingUp, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { IProfessional } from '@shared/types/professional';

interface StatsSectionProps {
  professional: IProfessional;
}

export function StatsSection({ professional }: StatsSectionProps) {
  const { stats } = professional;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getCompletionRate = () => {
    if (stats.totalAppointments === 0) return 0;
    return (stats.completedAppointments / stats.totalAppointments) * 100;
  };

  const getCancellationRate = () => {
    if (stats.totalAppointments === 0) return 0;
    return (stats.cancelledAppointments / stats.totalAppointments) * 100;
  };

  const getNoShowRate = () => {
    if (stats.totalAppointments === 0) return 0;
    return (stats.noShowAppointments / stats.totalAppointments) * 100;
  };

  const getPatientRetentionRate = () => {
    if (stats.totalPatients === 0) return 0;
    return (stats.activePatients / stats.totalPatients) * 100;
  };

  const completionRate = getCompletionRate();
  const cancellationRate = getCancellationRate();
  const noShowRate = getNoShowRate();
  const patientRetentionRate = getPatientRetentionRate();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Estadísticas</h3>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
              <p className="text-sm text-muted-foreground">Pacientes Totales</p>
            </div>
          </div>
        </div>

        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.activePatients}</p>
              <p className="text-sm text-muted-foreground">Pacientes Activos</p>
            </div>
          </div>
        </div>

        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              <p className="text-sm text-muted-foreground">Citas Totales</p>
            </div>
          </div>
        </div>

        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">
                {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                Valoración ({stats.totalReviews} reseñas)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Statistics */}
        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/30">
            <Calendar className="h-5 w-5" />
            <h4 className="text-sm font-semibold">Estadísticas de Citas</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.completedAppointments}</span>
                  <Badge variant="outline">{formatPercentage(completionRate)}</Badge>
                </div>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Canceladas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.cancelledAppointments}</span>
                  <Badge variant="outline">{formatPercentage(cancellationRate)}</Badge>
                </div>
              </div>
              <Progress value={cancellationRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">No se presentaron</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.noShowAppointments}</span>
                  <Badge variant="outline">{formatPercentage(noShowRate)}</Badge>
                </div>
              </div>
              <Progress value={noShowRate} className="h-2" />
            </div>
          </div>
        </div>

        {/* Patient Statistics */}
        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/30">
            <Users className="h-5 w-5" />
            <h4 className="text-sm font-semibold">Estadísticas de Pacientes</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasa de Retención</span>
                <Badge variant="outline">{formatPercentage(patientRetentionRate)}</Badge>
              </div>
              <Progress value={patientRetentionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Porcentaje de pacientes que siguen activos
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.activePatients}</p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">
                  {stats.totalPatients - stats.activePatients}
                </p>
                <p className="text-sm text-muted-foreground">Inactivos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/30">
            <TrendingUp className="h-5 w-5" />
            <h4 className="text-sm font-semibold">Métricas de Rendimiento</h4>
          </div>
          <div className="space-y-4">
            {stats.averageRating && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Valoración Promedio</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({stats.totalReviews})
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm">Tasa de Finalización</span>
              <Badge 
                variant={completionRate >= 80 ? 'default' : completionRate >= 60 ? 'secondary' : 'destructive'}
              >
                {formatPercentage(completionRate)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Citas por Paciente</span>
              <span className="font-medium">
                {stats.totalPatients > 0 
                  ? (stats.totalAppointments / stats.totalPatients).toFixed(1)
                  : '0'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Statistics */}
        {stats.totalRevenue !== undefined && (
          <div className="p-4 border border-border/50 rounded-lg">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/30">
              <DollarSign className="h-5 w-5" />
              <h4 className="text-sm font-semibold">Estadísticas Financieras</h4>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {stats.completedAppointments > 0 
                      ? formatCurrency(stats.totalRevenue / stats.completedAppointments)
                      : formatCurrency(0)
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Ingreso por Cita</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {stats.activePatients > 0 
                      ? formatCurrency(stats.totalRevenue / stats.activePatients)
                      : formatCurrency(0)
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Ingreso por Paciente</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Insights */}
      <div className="p-4 border border-border/50 rounded-lg">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/30">
          <BarChart3 className="h-5 w-5" />
          <h4 className="text-sm font-semibold">Resumen de Rendimiento</h4>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Fortalezas</p>
              <div className="text-sm text-green-700 mt-2 space-y-1">
                {completionRate >= 80 && <p>• Alta tasa de finalización</p>}
                {patientRetentionRate >= 70 && <p>• Buena retención de pacientes</p>}
                {stats.averageRating && stats.averageRating >= 4.0 && <p>• Excelente valoración</p>}
                {cancellationRate <= 10 && <p>• Baja tasa de cancelación</p>}
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-semibold text-yellow-800">Áreas de Mejora</p>
              <div className="text-sm text-yellow-700 mt-2 space-y-1">
                {completionRate < 60 && <p>• Mejorar tasa de finalización</p>}
                {noShowRate > 15 && <p>• Reducir ausencias</p>}
                {patientRetentionRate < 50 && <p>• Mejorar retención</p>}
                {stats.totalReviews < 10 && <p>• Obtener más reseñas</p>}
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-blue-800">Actividad</p>
              <div className="text-sm text-blue-700 mt-2 space-y-1">
                <p>• {stats.totalAppointments} citas realizadas</p>
                <p>• {stats.activePatients} pacientes activos</p>
                {stats.averageRating && (
                  <p>• {stats.averageRating.toFixed(1)}★ valoración promedio</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
