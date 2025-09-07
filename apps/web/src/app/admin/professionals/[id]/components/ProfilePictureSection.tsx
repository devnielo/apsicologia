'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, X, Upload, Trash2, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfilePictureData {
  profilePicture?: string;
}

interface ProfilePictureSectionProps {
  professional: any;
  isEditing: boolean;
  editData: ProfilePictureData;
  onEdit: (data: ProfilePictureData) => void;
  onSave: (data: ProfilePictureData) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

export function ProfilePictureSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: ProfilePictureSectionProps) {
  const [localData, setLocalData] = useState<ProfilePictureData>(() => {
    if (isEditing && editData) {
      return editData;
    }
    return {
      profilePicture: professional?.profilePicture || ''
    };
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional) {
      setLocalData({
        profilePicture: professional?.profilePicture || ''
      });
      setPreviewUrl(null);
    } else if (isEditing && editData) {
      setLocalData(editData);
      setPreviewUrl(null);
    }
  }, [professional, isEditing, editData]);

  const handleLocalChange = useCallback((updatedData: ProfilePictureData) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleEdit = () => {
    const initialData: ProfilePictureData = {
      profilePicture: professional?.profilePicture || ''
    };
    setLocalData(initialData);
    onEdit(initialData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo de imagen válido',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'El archivo es demasiado grande. Máximo 5MB permitido',
        variant: 'destructive'
      });
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      handleLocalChange({
        ...localData,
        profilePicture: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    setPreviewUrl(null);
    handleLocalChange({
      ...localData,
      profilePicture: ''
    });
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getDisplayUrl = () => {
    if (previewUrl) return previewUrl;
    return localData.profilePicture || '';
  };

  const getInitials = () => {
    const firstName = professional?.firstName || '';
    const lastName = professional?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Foto de Perfil</h2>
          <p className="text-sm text-muted-foreground">
            Imagen que aparecerá en el perfil del profesional
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
              onClick={() => onEdit({ profilePicture: professional?.profilePicture || '' })}
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
        {/* Current Picture Display */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage 
              src={getDisplayUrl()} 
              alt={`${professional?.firstName} ${professional?.lastName}`}
            />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials() || <User className="h-12 w-12" />}
            </AvatarFallback>
          </Avatar>

          {/* Upload Controls */}
          {(isEditing || isCreateMode) && (
            <div className="flex flex-col items-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {localData.profilePicture ? 'Cambiar Foto' : 'Subir Foto'}
                </Button>
                
                {localData.profilePicture && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePicture}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: JPG, PNG, GIF
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Picture Info */}
        {!isEditing && !isCreateMode && (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Estado de la Foto</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {localData.profilePicture 
                    ? 'Foto de perfil configurada' 
                    : 'Sin foto de perfil'
                  }
                </p>
              </div>
              {localData.profilePicture ? (
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              ) : (
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              )}
            </div>
          </div>
        )}

        {/* Guidelines */}
        {(isEditing || isCreateMode) && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Recomendaciones para la foto de perfil:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use una foto profesional y de buena calidad</li>
              <li>• Asegúrese de que el rostro sea claramente visible</li>
              <li>• Evite fotos con filtros o efectos</li>
              <li>• Mantenga un fondo neutro y profesional</li>
              <li>• La imagen debe ser cuadrada para mejor visualización</li>
            </ul>
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
