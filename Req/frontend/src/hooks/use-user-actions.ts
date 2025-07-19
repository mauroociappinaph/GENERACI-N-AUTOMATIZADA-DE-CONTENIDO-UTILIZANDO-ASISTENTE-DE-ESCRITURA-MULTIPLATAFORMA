'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';
import { useUserManagement } from './use-user-management';

interface FetchUsersParams {
  page: number;
  limit: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export function useUserActions() {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const {
    createUser: createUserService,
    updateUser: updateUserService,
    toggleUserStatus: toggleUserStatusService,
    deleteUser: deleteUserService,
    fetchUsers,
  } = useUserManagement();

  const handleCreateUser = async (
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    },
    fetchParams: FetchUsersParams,
    onSuccess?: () => void
  ) => {
    try {
      await createUserService(userData);
      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente',
      });
      await fetchUsers(fetchParams);
      onSuccess?.();
    } catch (createError) {
      toast({
        title: 'Error al crear usuario',
        description:
          createError instanceof Error
            ? createError.message
            : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = async (
    userId: string,
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    },
    fetchParams: FetchUsersParams,
    onSuccess?: () => void
  ) => {
    try {
      await updateUserService(userId, userData);
      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado exitosamente',
      });
      await fetchUsers(fetchParams);
      onSuccess?.();
    } catch (updateError) {
      toast({
        title: 'Error al actualizar usuario',
        description:
          updateError instanceof Error
            ? updateError.message
            : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (
    userId: string,
    fetchParams: FetchUsersParams
  ) => {
    try {
      await toggleUserStatusService(userId);
      toast({
        title: 'Estado actualizado',
        description: 'El estado del usuario ha sido actualizado exitosamente',
      });
      await fetchUsers(fetchParams);
    } catch (toggleError) {
      toast({
        title: 'Error al cambiar estado del usuario',
        description:
          toggleError instanceof Error
            ? toggleError.message
            : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async (fetchParams: FetchUsersParams) => {
    if (!userToDelete) return;

    try {
      await deleteUserService(userToDelete);
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente',
      });
      await fetchUsers(fetchParams);
    } catch (deleteError) {
      toast({
        title: 'Error al eliminar usuario',
        description:
          deleteError instanceof Error
            ? deleteError.message
            : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  return {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    userToDelete,
    handleCreateUser,
    handleEditUser,
    handleToggleStatus,
    handleDeleteUser,
    confirmDeleteUser,
  };
}
