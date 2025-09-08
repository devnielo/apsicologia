'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, Clock, Euro, Users, Activity } from 'lucide-react';
import { Service } from '../types';
import { cn } from '@/lib/utils';

interface UseServiceColumnsProps {
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
}

export function useServiceColumns({ onEdit, onDelete, onView }: UseServiceColumnsProps) {
  return useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Servicio',
        cell: ({ row }) => {
          const service = row.original;
          return (
            <div className="flex items-center space-x-3">
              {service.color && (
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: service.color }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">
                  {service.name}
                </div>
                {service.description && (
                  <div className="text-sm text-muted-foreground truncate">
                    {service.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Categoría',
        cell: ({ getValue }) => {
          const category = getValue() as string;
          return category ? (
            <Badge variant="secondary" className="font-normal">
              {category}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Sin categoría</span>
          );
        },
      },
      {
        accessorKey: 'durationMinutes',
        header: 'Duración',
        cell: ({ getValue }) => {
          const duration = getValue() as number;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          
          return (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>
                {hours > 0 && `${hours}h `}
                {minutes > 0 && `${minutes}min`}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => {
          const service = row.original;
          const finalPrice = service.priceDetails.discountedPrice || service.price;
          const hasDiscount = service.priceDetails.discountedPrice && 
                             service.priceDetails.discountedPrice < service.price;
          
          return (
            <div className="flex items-center gap-1">
              <Euro className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-col">
                {hasDiscount ? (
                  <>
                    <span className="font-medium text-green-600">
                      {finalPrice.toFixed(2)} {service.currency}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {service.price.toFixed(2)} {service.currency}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">
                    {service.price.toFixed(2)} {service.currency}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'availability',
        header: 'Disponibilidad',
        cell: ({ row }) => {
          const service = row.original;
          
          return (
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {service.isOnlineAvailable && (
                  <Badge variant="default" className="text-xs">
                    Online
                  </Badge>
                )}
                {!service.isOnlineAvailable && (
                  <Badge variant="secondary" className="text-xs">
                    Presencial
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                {service.isPubliclyBookable ? (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    Público
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                    Restringido
                  </Badge>
                )}
                {service.requiresApproval && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                    Aprobación
                  </Badge>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'professionals',
        header: 'Profesionales',
        cell: ({ row }) => {
          const service = row.original;
          const professionalCount = service.availableTo.length;
          
          return (
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>
                {professionalCount === 0 ? 'Todos' : `${professionalCount} asignados`}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'stats',
        header: 'Estadísticas',
        cell: ({ row }) => {
          const service = row.original;
          const { stats } = service;
          
          return (
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span>{stats.totalBookings} reservas</span>
              </div>
              {stats.averageRating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{stats.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Estado',
        cell: ({ getValue, row }) => {
          const isActive = getValue() as boolean;
          const service = row.original;
          
          return (
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={cn(
                "font-normal",
                isActive 
                  ? "bg-green-100 text-green-800 hover:bg-green-200" 
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {isActive ? 'Activo' : 'Inactivo'}
              {service.deletedAt && ' (Eliminado)'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ getValue }) => {
          const tags = getValue() as string[];
          
          if (!tags || tags.length === 0) {
            return <span className="text-muted-foreground text-sm">Sin tags</span>;
          }
          
          return (
            <div className="flex flex-wrap gap-1 max-w-[150px]">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Fecha de creación',
        cell: ({ getValue }) => {
          const date = getValue() as Date;
          return (
            <div className="text-sm text-muted-foreground">
              {format(new Date(date), "dd/MM/yyyy", { locale: es })}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const service = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(service)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(service)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, onView]
  );
}
