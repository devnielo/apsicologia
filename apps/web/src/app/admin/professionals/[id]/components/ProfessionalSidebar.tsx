'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Calendar, Clock, Phone, Mail, MapPin, Award, Users, Star, Camera, Upload, X } from 'lucide-react';
import { base64ToImageUrl } from '../../../../../lib/utils';

interface ProfessionalSidebarProps {
  professional: any;
  onProfilePictureUpdate?: (base64Image: string) => void;
}

function calculateYearsOfExperience(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
}

export function ProfessionalSidebar({ professional, onProfilePictureUpdate }: ProfessionalSidebarProps) {
  const fullName = professional?.name || 'Profesional';
  const yearsOfExperience = professional?.yearsOfExperience || 0;
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'on_leave':
        return 'De baja';
      case 'suspended':
        return 'Suspendido';
      default:
        return 'Desconocido';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (previewImage && onProfilePictureUpdate) {
      onProfilePictureUpdate(previewImage);
      setIsEditingPhoto(false);
      setPreviewImage(null);
    }
  };

  const handleCancelPhoto = () => {
    setIsEditingPhoto(false);
    setPreviewImage(null);
  };

  return (
    <div className="w-80 space-y-4">
      {/* Professional Avatar and Basic Info */}
      <div className="text-center p-3 border-b border-border/30">
        <div className="relative inline-block mb-3">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={previewImage || (professional?.avatar ? base64ToImageUrl(professional.avatar) : undefined)} 
              alt={fullName}
            />
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {generateInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          
          {/* Photo Edit Button */}
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 bg-background border-2 border-background shadow-sm hover:bg-muted"
            onClick={() => setIsEditingPhoto(true)}
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Photo Upload Modal */}
        {isEditingPhoto && (
          <div className="mb-3 p-3 border rounded-lg bg-muted/50">
            <div className="space-y-3">
              <div className="text-sm font-medium">Actualizar foto de perfil</div>
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs"
              />
              
              {previewImage && (
                <div className="flex justify-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={previewImage} alt="Preview" />
                    <AvatarFallback>{generateInitials(fullName)}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelPhoto}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePhoto}
                  disabled={!previewImage}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-base font-semibold text-foreground mb-1">{fullName}</h2>
        <p className="text-sm text-muted-foreground mb-2">
          {professional?.title || 'Profesional'}
        </p>
        
        <Badge 
          variant={professional?.status === 'active' ? 'default' : 'secondary'}
          className="text-sm bg-primary text-primary-foreground"
        >
          {getStatusLabel(professional?.status || 'inactive')}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="pb-3 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Estadísticas</h3>
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Experiencia:</span>
            <span className="text-foreground font-medium">{yearsOfExperience} años</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pacientes:</span>
            <span className="text-foreground font-medium">{professional?.stats?.activePatients || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Citas:</span>
            <span className="text-foreground font-medium">{professional?.stats?.totalAppointments || 0}</span>
          </div>
          {professional?.stats?.averageRating && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valoración:</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-foreground font-medium">{professional.stats.averageRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="pb-3 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Contacto</h3>
        <div className="space-y-2 px-1">
          {professional?.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground truncate">{professional.email}</span>
            </div>
          )}
          {professional?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{professional.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Specialties */}
      {professional?.specialties && professional.specialties.length > 0 && (
        <div className="pb-3 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Especialidades</h3>
          <div className="flex flex-wrap gap-1 px-1">
            {professional.specialties.slice(0, 3).map((specialty: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {professional.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{professional.specialties.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Professional Info */}
      <div className="pb-3 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Información Profesional</h3>
        <div className="space-y-2 px-1">
          {professional?.licenseNumber && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Licencia:</span>
              <span className="text-foreground font-mono text-xs">{professional.licenseNumber}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nuevos pacientes:</span>
            <Badge 
              variant={professional?.isAcceptingNewPatients ? "default" : "secondary"}
              className="text-xs"
            >
              {professional?.isAcceptingNewPatients ? 'Sí' : 'No'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Languages */}
      {professional?.languages && professional.languages.length > 0 && (
        <div className="px-1">
          <h3 className="text-sm font-semibold text-foreground mb-3">Idiomas</h3>
          <div className="flex flex-wrap gap-1">
            {professional.languages.slice(0, 2).map((language: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language === 'es' ? 'Español' : language === 'en' ? 'Inglés' : language}
              </Badge>
            ))}
            {professional.languages.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{professional.languages.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
