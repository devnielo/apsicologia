import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export function useSessions(patientId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await api.patients.addSession(patientId, sessionData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Sesión guardada',
        description: 'La sesión se ha registrado correctamente.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al guardar',
        description: error.response?.data?.message || 'No se pudo guardar la sesión.',
        variant: 'destructive',
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, sessionData }: { sessionId: string; sessionData: any }) => {
      const response = await api.patients.updateSession(patientId, sessionId, sessionData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Sesión actualizada',
        description: 'La sesión se ha actualizado correctamente.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar',
        description: error.response?.data?.message || 'No se pudo actualizar la sesión.',
        variant: 'destructive',
      });
    },
  });

  return {
    addSession: addSessionMutation.mutateAsync,
    updateSession: updateSessionMutation.mutateAsync,
    isLoading: addSessionMutation.isPending || updateSessionMutation.isPending,
  };
}
