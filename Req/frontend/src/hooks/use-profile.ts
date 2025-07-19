import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
}

export const useProfile = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get<{ user: UserProfile }>('/api/users/profile');

      if (!data?.data?.user) {
        throw new Error('Respuesta de API inválida');
      }

      setProfile(data.data.user);
      setFormData({
        email: data.data.user.email,
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data = await api.put<{ user: UserProfile }>(
        '/api/users/profile',
        formData
      );

      if (!data?.data?.user) {
        throw new Error('Respuesta de API inválida');
      }

      setProfile(data.data.user);
      setIsEditing(false);

      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al actualizar perfil',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [token, router, fetchProfile]);

  return {
    profile,
    isLoading,
    isEditing,
    isSaving,
    formData,
    setFormData,
    setIsEditing,
    handleSave,
    handleCancel,
  };
};
