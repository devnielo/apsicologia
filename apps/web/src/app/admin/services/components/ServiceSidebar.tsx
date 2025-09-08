'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Settings, 
  Clock, 
  Euro, 
  Users,
  Activity,
  Globe,
  ShieldCheck,
  Tag,
  Calendar,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Service } from '../types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiceSidebarProps {
  service?: Service;
  isLoading?: boolean;
  className?: string;
}

export function ServiceSidebar({ service, isLoading, className }: ServiceSidebarProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={cn("w-80 border-r border-border/50 bg-muted/30", className)}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted animate-pulse rounded" />
              <div className="flex-1">
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={cn("w-80 border-r border-border/50 bg-muted/30", className)}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/services')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Servicios
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No hay servicio seleccionado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = service.priceDetails.discountedPrice || service.price;
  const hasDiscount = service.priceDetails.discountedPrice && 
                     service.priceDetails.discountedPrice < service.price;

  return (
    <div className={cn("w-80 border-r border-border/50 bg-muted/30", className)}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/services')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Servicios
          </Button>

          {/* Service Header */}
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: service.color || '#6B7280' }}
            >
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {service.name}
              </h3>
              {service.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {service.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant={service.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {service.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
                {service.category && (
                  <Badge variant="outline" className="text-xs">
                    {service.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Pricing */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Euro className="h-4 w-4 text-primary" />
                Precio
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Precio base</span>
                  <span className={cn(
                    "font-medium text-sm",
                    hasDiscount ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    €{service.price.toFixed(2)}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precio con descuento</span>
                    <span className="font-medium text-sm text-green-600">
                      €{finalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Moneda</span>
                  <span className="text-sm text-foreground">{service.currency}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Duration */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Duración y Configuración
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(service.durationMinutes / 60) > 0 && 
                      `${Math.floor(service.durationMinutes / 60)}h `}
                    {service.durationMinutes % 60 > 0 && 
                      `${service.durationMinutes % 60}min`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buffer antes</span>
                  <span className="text-sm text-foreground">{service.settings.bufferBefore}min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buffer después</span>
                  <span className="text-sm text-foreground">{service.settings.bufferAfter}min</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Disponibilidad
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Online</span>
                  <Badge variant={service.isOnlineAvailable ? "default" : "secondary"} className="text-xs">
                    {service.isOnlineAvailable ? 'Disponible' : 'No disponible'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Público</span>
                  <Badge variant={service.isPubliclyBookable ? "default" : "secondary"} className="text-xs">
                    {service.isPubliclyBookable ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Requiere aprobación</span>
                  <Badge variant={service.requiresApproval ? "destructive" : "default"} className="text-xs">
                    {service.requiresApproval ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Professionals */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Profesionales
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Asignados</span>
                <span className="text-sm text-foreground">
                  {service.availableTo.length === 0 
                    ? 'Todos los profesionales' 
                    : `${service.availableTo.length} profesional${service.availableTo.length !== 1 ? 'es' : ''}`
                  }
                </span>
              </div>
            </div>

            <Separator />

            {/* Statistics */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Estadísticas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total reservas</span>
                  <span className="text-sm text-foreground">{service.stats.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completadas</span>
                  <span className="text-sm text-foreground">{service.stats.completedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Canceladas</span>
                  <span className="text-sm text-foreground">{service.stats.cancelledBookings}</span>
                </div>
                {service.stats.averageRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Calificación</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-foreground">
                        {service.stats.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ingresos totales</span>
                  <span className="text-sm text-foreground">€{service.stats.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Timestamps */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Información
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Creado</span>
                  <span className="text-sm text-foreground">
                    {format(new Date(service.createdAt), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actualizado</span>
                  <span className="text-sm text-foreground">
                    {format(new Date(service.updatedAt), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
