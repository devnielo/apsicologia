'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, AlertTriangle } from 'lucide-react';

interface EmergencyContactSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export function EmergencyContactSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: EmergencyContactSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Contacto de Emergencia
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit('emergencyContact', patient.emergencyContact || {})}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {editingSection === 'emergencyContact' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyName">Nombre</Label>
                <Input
                  id="emergencyName"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelationship">Relación</Label>
                <Input
                  id="emergencyRelationship"
                  value={editData.relationship || ''}
                  onChange={(e) => setEditData({...editData, relationship: e.target.value})}
                  placeholder="Ej: Cónyuge, Padre, Hermano"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyPhone">Teléfono</Label>
                <Input
                  id="emergencyPhone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <Label htmlFor="emergencyEmail">Email (Opcional)</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="contacto@email.com"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => onSave('emergencyContact')} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre</label>
              <p className="text-gray-900">{patient.emergencyContact?.name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Relación</label>
              <p className="text-gray-900">{patient.emergencyContact?.relationship || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-gray-900">{patient.emergencyContact?.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{patient.emergencyContact?.email || 'No especificado'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
