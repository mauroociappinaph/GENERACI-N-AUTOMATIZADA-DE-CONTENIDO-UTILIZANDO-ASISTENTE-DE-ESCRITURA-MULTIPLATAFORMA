import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { UserRole } from '@/types';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [roles, setRoles] = useState<UserRole[]>([]);

  const fetchUsers = useCallback(async (params: FetchUsersParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.role) queryParams.append('role', params.role);
      if (params.isActive !== undefined)
        queryParams.append('isActive', params.isActive.toString());
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/users?${queryParams.toString()}`);

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination({
          page: response.data.data.page,
          limit: response.data.data.limit || 10,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        });
      } else {
        throw new Error('Error al obtener usuarios');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Error al obtener usuarios'
      );
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get('/users/roles');
      if (response.data.success) {
        setRoles(response.data.data.roles);
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      setError(null);
      const response = await api.post('/users', userData);

      if (!response.data.success) {
        throw new Error('Error al crear usuario');
      }

      return response.data.data.user;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Error al crear usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateUser = useCallback(
    async (userId: string, userData: UpdateUserData) => {
      try {
        setError(null);
        const response = await api.put(`/users/${userId}`, userData);

        if (!response.data.success) {
          throw new Error('Error al actualizar usuario');
        }

        return response.data.data.user;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message || 'Error al actualizar usuario';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      setError(null);
      const response = await api.patch(`/users/${userId}/toggle-status`);

      if (!response.data.success) {
        throw new Error('Error al cambiar estado del usuario');
      }

      return response.data.data.user;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        'Error al cambiar estado del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      const response = await api.delete(`/users/${userId}`);

      if (!response.data.success) {
        throw new Error('Error al eliminar usuario');
      }

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Error al eliminar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const changePassword = useCallback(
    async (userId: string, currentPassword: string, newPassword: string) => {
      try {
        setError(null);
        const response = await api.put(`/users/${userId}/password`, {
          currentPassword,
          newPassword,
        });

        if (!response.data.success) {
          throw new Error('Error al cambiar contraseña');
        }

        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message || 'Error al cambiar contraseña';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    users,
    loading,
    error,
    pagination,
    roles,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    changePassword,
  };
}
