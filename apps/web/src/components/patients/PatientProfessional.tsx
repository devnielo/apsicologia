'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Calendar, Star, Clock } from 'lucide-react';

interface PatientProfessionalProps {
  patientId: string;
  patient?: any;
}

export function PatientProfessional({ patientId, patient }: PatientProfessionalProps) {
  // Get the primary professional from patient data or fetch recent appointments to determine
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', 'patient', patientId, 'recent'],
    queryFn: async () => {
      const response = await api.appointments.getByPatient(patientId, { 
        limit: 10,
        includeHistory: true 
      });
      const responseData = response.data.data as any;
      // Handle both direct array response and wrapped response
      if (Array.isArray(responseData)) {
        return responseData;
      } else if (responseData?.appointments) {
        return responseData.appointments;
      }
      return [];
    },
    enabled: !!patientId // Always fetch appointments if we have a patient ID
  });

  // Determine the primary professional
  const assignedProfessional = patient?.assignedProfessional;
  const mostRecentProfessional = appointments && appointments.length > 0 
    ? appointments
        .filter((apt: any) => (apt.professional || apt.professionalId) && apt.status === 'completed')
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]?.professional || appointments[0]?.professionalId
    : null;

  const primaryProfessional = assignedProfessional || mostRecentProfessional;

  // Get professional details if we have an ID
  const { data: professionalDetails, isLoading: professionalLoading } = useQuery({
    queryKey: ['professional', primaryProfessional?._id || primaryProfessional],
    queryFn: async () => {
      const id = primaryProfessional?._id || primaryProfessional;
      if (!id) return null;
      const response = await api.professionals.get(id);
      return response.data.data;
    },
    enabled: !!(primaryProfessional?._id || primaryProfessional) && !primaryProfessional?.personalInfo
  });

  const professional = professionalDetails || primaryProfessional;

  const isLoading = appointmentsLoading || professionalLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profesional Asignado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!professional) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profesional Asignado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay profesional asignado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Se asignará automáticamente tras la primera cita
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getSpecialtyBadges = (specialties: string[] = []) => {
    return specialties.slice(0, 2).map((specialty, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        {specialty}
      </Badge>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profesional Asignado
          {assignedProfessional && (
            <Badge variant="default" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Principal
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Professional info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={professional.profileImage} 
              alt={`${professional.personalInfo?.firstName} ${professional.personalInfo?.lastName}`}
            />
            <AvatarFallback>
              {getInitials(professional.personalInfo?.firstName, professional.personalInfo?.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <h4 className="font-medium">
              Dr/a. {professional.personalInfo?.firstName} {professional.personalInfo?.lastName}
            </h4>
            
            {professional.professionalInfo?.title && (
              <p className="text-sm text-muted-foreground">
                {professional.professionalInfo.title}
              </p>
            )}

            {professional.professionalInfo?.specialties && (
              <div className="flex gap-1">
                {getSpecialtyBadges(professional.professionalInfo.specialties)}
              </div>
            )}
          </div>
        </div>

        {/* Contact information */}
        <div className="space-y-2">
          {professional.contactInfo?.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{professional.contactInfo.email}</span>
            </div>
          )}

          {professional.contactInfo?.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{professional.contactInfo.phone}</span>
            </div>
          )}

          {professional.professionalInfo?.licenseNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Colegiado: {professional.professionalInfo.licenseNumber}
              </Badge>
            </div>
          )}
        </div>

        {/* Stats from recent appointments */}
        {appointments && appointments.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-medium">
                  {appointments.filter((apt: any) => 
                    (apt.professional?._id || apt.professionalId?._id || apt.professionalId) === (professional._id || professional)
                  ).length}
                </div>
                <div className="text-xs text-muted-foreground">Citas</div>
              </div>
              <div>
                <div className="text-lg font-medium">
                  {appointments.filter((apt: any) => 
                    (apt.professional?._id || apt.professionalId?._id || apt.professionalId) === (professional._id || professional) && 
                    apt.status === 'completed'
                  ).length}
                </div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Calendar className="h-4 w-4 mr-1" />
            Nueva Cita
          </Button>
          {professional.contactInfo?.email && (
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
