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

interface ApiResponse<TData = unknown> {
  success: boolean;
  data: TData;
  error?: {
    message: string;
  };
}

interface ApiError {
  response?: {
    data?: {
      error?: {
        message: string;
      };
    };
  };
  message?: string;
}

interface UsersResponse {
  users: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RolesResponse {
  roles: UserRole[];
}

interface UserResponse {
  user: User;
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

  const buildQueryParams = useCallback((params: FetchUsersParams) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined)
      queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);
    return queryParams.toString();
  }, []);

  const handleFetchUsersSuccess = useCallback(
    (responseData: ApiResponse<UsersResponse>) => {
      setUsers(responseData.data.users);
      setPagination({
        page: responseData.data.page,
        limit: responseData.data.limit || 10,
        total: responseData.data.total,
        totalPages: responseData.data.totalPages,
      });
    },
    []
  );

  const handleFetchUsersError = useCallback((err: ApiError) => {
    const errorMessage =
      err.response?.data?.error?.message || 'Error al obtener usuarios';
    setError(errorMessage);
  }, []);

  const fetchUsers = useCallback(
    async (params: FetchUsersParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const queryString = buildQueryParams(params);
        const response = await api.get<ApiResponse<UsersResponse>>(
          `/users?${queryString}`
        );

        if (response?.data?.success) {
          handleFetchUsersSuccess(response.data);
        } else {
          throw new Error('Error al obtener usuarios');
        }
      } catch (err: unknown) {
        handleFetchUsersError(err as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams, handleFetchUsersSuccess, handleFetchUsersError]
  );

  const fetchRoles = useCallback(async () => {
    try {
      const response =
        await api.get<ApiResponse<RolesResponse>>('/users/roles');
      if (response?.data?.success) {
        setRoles(response.data.data.roles);
      }
    } catch (err: unknown) {
      /* empty */
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      setError(null);
      const response = await api.post<ApiResponse<UserResponse>>(
        '/users',
        userData
      );

      if (!response?.data?.success) {
        throw new Error('Error al crear usuario');
      }

      return response.data.data.user;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.error?.message || 'Error al crear usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateUser = useCallback(
    async (userId: string, userData: UpdateUserData) => {
      try {
        setError(null);
        const response = await api.put<ApiResponse<UserResponse>>(
          `/users/${userId}`,
          userData
        );

        if (!response?.data?.success) {
          throw new Error('Error al actualizar usuario');
        }

        return response.data.data.user;
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.error?.message ||
          'Error al actualizar usuario';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      setError(null);
      const response = await api.patch<ApiResponse<UserResponse>>(
        `/users/${userId}/toggle-status`
      );

      if (!response?.data?.success) {
        throw new Error('Error al cambiar estado del usuario');
      }

      return response.data.data.user;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.error?.message ||
        'Error al cambiar estado del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      const response = await api.delete<ApiResponse<{ success: boolean }>>(
        `/users/${userId}`
      );

      if (!response?.data?.success) {
        throw new Error('Error al eliminar usuario');
      }

      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.error?.message || 'Error al eliminar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const changePassword = useCallback(
    async (userId: string, currentPassword: string, newPassword: string) => {
      try {
        setError(null);
        const response = await api.put<ApiResponse<{ success: boolean }>>(
          `/users/${userId}/password`,
          {
            currentPassword,
            newPassword,
          }
        );

        if (!response?.data?.success) {
          throw new Error('Error al cambiar contraseña');
        }

        return true;
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.error?.message ||
          'Error al cambiar contraseña';
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
