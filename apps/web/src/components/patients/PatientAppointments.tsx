'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, User, Video, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientAppointmentsProps {
  patientId: string;
  limit?: number;
  showHistory?: boolean;
}

export function PatientAppointments({ 
  patientId, 
  limit = 5, 
  showHistory = false 
}: PatientAppointmentsProps) {
  const { data: appointmentsResponse, isLoading, error } = useQuery({
    queryKey: ['appointments', 'patient', patientId, { limit, includeHistory: showHistory }],
    queryFn: async () => {
      const response = await api.appointments.getByPatient(patientId, { 
        limit, 
        includeHistory: showHistory 
      });
      const responseData = response.data.data as any;
      // Handle both direct array response and wrapped response
      if (Array.isArray(responseData)) {
        return responseData;
      } else if (responseData?.appointments) {
        return responseData.appointments;
      }
      return [];
    }
  });

  // Ensure appointments is always an array
  const appointments = Array.isArray(appointmentsResponse) ? appointmentsResponse : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {showHistory ? 'Historial de Citas' : 'Últimas Citas'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {showHistory ? 'Historial de Citas' : 'Últimas Citas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Error al cargar las citas</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Programada', variant: 'default' as const },
      confirmed: { label: 'Confirmada', variant: 'secondary' as const },
      'in-progress': { label: 'En Curso', variant: 'default' as const },
      completed: { label: 'Completada', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
      'no-show': { label: 'No Asistió', variant: 'destructive' as const },
      rescheduled: { label: 'Reprogramada', variant: 'secondary' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'in-person':
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {showHistory ? 'Historial de Citas' : 'Últimas Citas'}
          {appointments && appointments.length > 0 && (
            <Badge variant="secondary">{appointments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay citas registradas
          </p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <div 
                key={appointment._id} 
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                {/* Header with date and status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(appointment.startTime), 'EEEE, d MMMM yyyy', { locale: es })}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(appointment.startTime), 'HH:mm')} - 
                      {format(new Date(appointment.endTime), 'HH:mm')}
                    </span>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                {/* Service and professional info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getAppointmentTypeIcon(appointment.type || 'in-person')}
                    <span className="font-medium">{appointment.serviceId?.name || 'Servicio no especificado'}</span>
                  </div>
                  
                  {(appointment.professional || appointment.professionalId) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>
                        Dr/a. {(appointment.professional?.personalInfo || appointment.professionalId)?.firstName || appointment.professionalId?.name?.split(' ')[0]} {(appointment.professional?.personalInfo || appointment.professionalId)?.lastName || appointment.professionalId?.name?.split(' ')[1]}
                      </span>
                    </div>
                  )}

                  {/* Notes preview */}
                  {appointment.notes?.patientNotes && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                      <strong>Notas:</strong> {appointment.notes.patientNotes.substring(0, 100)}
                      {appointment.notes.patientNotes.length > 100 && '...'}
                    </div>
                  )}

                  {/* Payment status if relevant */}
                  {appointment.paymentStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Pago:</span>
                      <Badge variant={appointment.paymentStatus === 'paid' ? 'default' : 'outline'}>
                        {appointment.paymentStatus === 'paid' ? 'Pagado' : 
                         appointment.paymentStatus === 'pending' ? 'Pendiente' : 
                         appointment.paymentStatus === 'partial' ? 'Parcial' : 
                         'No Pagado'}
                      </Badge>
                      {appointment.pricing?.finalAmount && (
                        <span className="font-medium">€{appointment.pricing.finalAmount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
