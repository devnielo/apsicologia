'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, MapPin, Star } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface RoomsData {
  assignedRooms: string[];
  defaultRoom?: string;
}

interface RoomsSectionProps {
  professional: any;
  isEditing: boolean;
  editData: RoomsData;
  onEdit: (data: RoomsData) => void;
  onSave: (data: RoomsData) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

export function RoomsSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: RoomsSectionProps) {
  const [localData, setLocalData] = useState<RoomsData>(() => {
    if (isEditing && editData) {
      return editData;
    }
    return {
      assignedRooms: professional?.assignedRooms?.map((room: any) => room.id || room) || [],
      defaultRoom: professional?.defaultRoom?.id || professional?.defaultRoom || ''
    };
  });

  // Fetch available rooms
  const { data: availableRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await apiClient.get('/rooms');
      return response.data.data?.rooms || [];
    },
  });

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional) {
      setLocalData({
        assignedRooms: professional?.assignedRooms?.map((room: any) => room.id || room) || [],
        defaultRoom: professional?.defaultRoom?.id || professional?.defaultRoom || ''
      });
    } else if (isEditing && editData) {
      setLocalData(editData);
    }
  }, [professional, isEditing, editData]);

  const handleLocalChange = useCallback((updatedData: RoomsData) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleEdit = () => {
    const initialData: RoomsData = {
      assignedRooms: professional?.assignedRooms?.map((room: any) => room.id || room) || [],
      defaultRoom: professional?.defaultRoom?.id || professional?.defaultRoom || ''
    };
    setLocalData(initialData);
    onEdit(initialData);
  };

  const handleRoomToggle = (roomId: string, checked: boolean) => {
    let updatedRooms: string[];
    
    if (checked) {
      updatedRooms = [...localData.assignedRooms, roomId];
    } else {
      updatedRooms = localData.assignedRooms.filter(id => id !== roomId);
      // If removing the default room, clear it
      if (localData.defaultRoom === roomId) {
        handleLocalChange({
          assignedRooms: updatedRooms,
          defaultRoom: ''
        });
        return;
      }
    }
    
    handleLocalChange({
      ...localData,
      assignedRooms: updatedRooms
    });
  };

  const handleDefaultRoomChange = (roomId: string) => {
    handleLocalChange({
      ...localData,
      defaultRoom: roomId
    });
  };

  const getRoomById = (roomId: string) => {
    return availableRooms?.find((room: any) => room.id === roomId);
  };

  const getAssignedRoomsData = () => {
    if (!availableRooms) return [];
    return localData.assignedRooms
      .map(roomId => getRoomById(roomId))
      .filter(Boolean);
  };

  const getRoomTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'physical': 'Física',
      'virtual': 'Virtual',
      'hybrid': 'Híbrida'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Salas Asignadas</h2>
          <p className="text-sm text-muted-foreground">
            Gestión de salas físicas y virtuales disponibles para el profesional
          </p>
        </div>
        
        {!isCreateMode && !isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : isEditing && !isCreateMode ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit({
                assignedRooms: professional?.assignedRooms?.map((room: any) => room.id || room) || [],
                defaultRoom: professional?.defaultRoom?.id || professional?.defaultRoom || ''
              })}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="medical-button-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Available Rooms Selection */}
        {(isEditing || isCreateMode) && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Seleccionar Salas Disponibles
            </h3>
            
            {roomsLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Cargando salas...
              </div>
            ) : !availableRooms || availableRooms.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                No hay salas disponibles
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableRooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg"
                  >
                    <Checkbox
                      id={`room-${room.id}`}
                      checked={localData.assignedRooms.includes(room.id)}
                      onCheckedChange={(checked) => handleRoomToggle(room.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`room-${room.id}`} className="font-medium cursor-pointer">
                        {room.name}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getRoomTypeLabel(room.type)}
                        </Badge>
                        {room.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {typeof room.location === 'object' 
                              ? [
                                  room.location.building,
                                  room.location.floor ? `Piso ${room.location.floor}` : null,
                                  room.location.roomNumber ? `Sala ${room.location.roomNumber}` : null
                                ].filter(Boolean).join(' ') || 'Ubicación no especificada'
                              : String(room.location)
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assigned Rooms Display */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">
            Salas Asignadas ({localData.assignedRooms.length})
          </h3>
          
          {localData.assignedRooms.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-lg">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay salas asignadas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAssignedRoomsData().map((room: any) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{room.name}</h4>
                      {localData.defaultRoom === room.id && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getRoomTypeLabel(room.type)}
                      </Badge>
                      {room.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {typeof room.location === 'object' 
                            ? [
                                room.location.building,
                                room.location.floor ? `Piso ${room.location.floor}` : null,
                                room.location.roomNumber ? `Sala ${room.location.roomNumber}` : null
                              ].filter(Boolean).join(' ') || 'Ubicación no especificada'
                            : String(room.location)
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Room Selection */}
        {localData.assignedRooms.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Sala Predeterminada
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Sala que se seleccionará automáticamente para nuevas citas
            </p>
            
            {isEditing || isCreateMode ? (
              <Select
                value={localData.defaultRoom || ''}
                onValueChange={handleDefaultRoomChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sala predeterminada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin sala predeterminada</SelectItem>
                  {getAssignedRoomsData().map((room: any) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - {getRoomTypeLabel(room.type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-muted/30 rounded-md border">
                {localData.defaultRoom ? (
                  (() => {
                    const defaultRoom = getRoomById(localData.defaultRoom);
                    return defaultRoom ? (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{defaultRoom.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getRoomTypeLabel(defaultRoom.type)}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sala no encontrada</span>
                    );
                  })()
                ) : (
                  <span className="text-sm text-muted-foreground">Sin sala predeterminada</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {showValidation && validationErrors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <ul className="text-sm text-destructive space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
