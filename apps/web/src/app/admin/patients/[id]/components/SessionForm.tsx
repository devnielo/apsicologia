'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, Clock, Target, BookOpen, TrendingUp, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { SESSION_TYPES, SESSION_TYPE_LABELS, SESSION_STATUS, SESSION_STATUS_LABELS, MOOD_LEVEL_LABELS } from '@apsicologia/shared/constants';

const sessionSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  duration: z.number().min(15, 'Duración mínima 15 minutos').max(180, 'Duración máxima 3 horas'),
  type: z.enum([SESSION_TYPES.INDIVIDUAL, SESSION_TYPES.GROUP, SESSION_TYPES.FAMILY, SESSION_TYPES.ONLINE]),
  status: z.enum([SESSION_STATUS.SCHEDULED, SESSION_STATUS.COMPLETED, SESSION_STATUS.CANCELLED, SESSION_STATUS.NO_SHOW]),
  notes: z.string().min(1, 'Las notas son requeridas'),
  objectives: z.array(z.string()).optional(),
  homework: z.string().optional(),
  nextSessionPlan: z.string().optional(),
  mood: z.object({
    before: z.object({
      level: z.number().min(1).max(10),
      description: z.string()
    }).optional(),
    after: z.object({
      level: z.number().min(1).max(10),
      description: z.string()
    }).optional()
  }).optional(),
  progress: z.object({
    rating: z.number().min(1).max(10),
    observations: z.string()
  })
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionFormProps {
  patientId: string;
  session?: any; // Existing session for editing
  onSave: (data: SessionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SessionForm({ patientId, session, onSave, onCancel, isLoading }: SessionFormProps) {
  const [objectives, setObjectives] = useState<string[]>(session?.objectives || []);
  const [newObjective, setNewObjective] = useState('');

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      date: session?.date ? format(new Date(session.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      duration: session?.duration || 60,
      type: session?.type || SESSION_TYPES.INDIVIDUAL,
      status: session?.status || SESSION_STATUS.COMPLETED,
      notes: session?.notes || '',
      objectives: session?.objectives || [],
      homework: session?.homework || '',
      nextSessionPlan: session?.nextSessionPlan || '',
      mood: {
        before: session?.mood?.before || { level: 5, description: '' },
        after: session?.mood?.after || { level: 5, description: '' }
      },
      progress: {
        rating: session?.progress?.rating || 7,
        observations: session?.progress?.observations || ''
      }
    }
  });

  const addObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      const updatedObjectives = [...objectives, newObjective.trim()];
      setObjectives(updatedObjectives);
      form.setValue('objectives', updatedObjectives);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(updatedObjectives);
    form.setValue('objectives', updatedObjectives);
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      await onSave({ ...data, objectives });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="15" 
                        max="180" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SESSION_TYPES.INDIVIDUAL}>{SESSION_TYPE_LABELS[SESSION_TYPES.INDIVIDUAL]}</SelectItem>
                        <SelectItem value={SESSION_TYPES.GROUP}>{SESSION_TYPE_LABELS[SESSION_TYPES.GROUP]}</SelectItem>
                        <SelectItem value={SESSION_TYPES.FAMILY}>{SESSION_TYPE_LABELS[SESSION_TYPES.FAMILY]}</SelectItem>
                        <SelectItem value={SESSION_TYPES.ONLINE}>{SESSION_TYPE_LABELS[SESSION_TYPES.ONLINE]}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SESSION_STATUS.SCHEDULED}>{SESSION_STATUS_LABELS[SESSION_STATUS.SCHEDULED]}</SelectItem>
                        <SelectItem value={SESSION_STATUS.COMPLETED}>{SESSION_STATUS_LABELS[SESSION_STATUS.COMPLETED]}</SelectItem>
                        <SelectItem value={SESSION_STATUS.CANCELLED}>{SESSION_STATUS_LABELS[SESSION_STATUS.CANCELLED]}</SelectItem>
                        <SelectItem value={SESSION_STATUS.NO_SHOW}>{SESSION_STATUS_LABELS[SESSION_STATUS.NO_SHOW]}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Objectives */}
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos de la sesión
            </h3>
            <div className="space-y-3 pl-7">
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir objetivo..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button type="button" onClick={addObjective} variant="outline">
                  Añadir
                </Button>
              </div>
              
              {objectives.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {objectives.map((objective, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {objective}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => removeObjective(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Session Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Notas de la sesión
                </h3>
                <FormControl className="pl-7">
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Describe lo que ocurrió en la sesión, intervenciones realizadas, observaciones..."
                    className="min-h-[200px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Homework */}
          <FormField
            control={form.control}
            name="homework"
            render={({ field }) => (
              <FormItem>
                <h3 className="text-lg font-medium">Tareas asignadas</h3>
                <FormControl className="pl-7">
                  <RichTextEditor
                    content={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe las tareas o ejercicios asignados para realizar entre sesiones..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Next Session Plan */}
          <FormField
            control={form.control}
            name="nextSessionPlan"
            render={({ field }) => (
              <FormItem>
                <h3 className="text-lg font-medium">Plan para próxima sesión</h3>
                <FormControl className="pl-7">
                  <RichTextEditor
                    content={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe lo que se trabajará en la próxima sesión..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Mood Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evaluación del estado de ánimo
            </h3>
            <div className="space-y-6 pl-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Al inicio de la sesión</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="mood.before.level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nivel (1-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value || 5]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="w-full"
                              />
                              <div className="text-center text-sm font-medium">
                                <span className="font-semibold">{field.value || 5}/10</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {MOOD_LEVEL_LABELS[field.value as keyof typeof MOOD_LEVEL_LABELS] || 'Neutral'}
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mood.before.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Descripción</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Ansioso, preocupado..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Al final de la sesión</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="mood.after.level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nivel (1-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value || 5]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="w-full"
                              />
                              <div className="text-center text-sm font-medium">
                                <span className="font-semibold">{field.value || 5}/10</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {MOOD_LEVEL_LABELS[field.value as keyof typeof MOOD_LEVEL_LABELS] || 'Neutral'}
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mood.after.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Descripción</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Relajado, motivado..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Progress Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evaluación del progreso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <FormField
                control={form.control}
                name="progress.rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Calificación del progreso (1-10)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value || 7]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-medium">
                          {field.value || 7}/10
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress.observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Observaciones del progreso</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el progreso observado en esta sesión..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar sesión'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
