'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';
import { UserManagementTable } from '@/components/admin/user-management-table';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { useUserManagement } from '@/hooks/use-user-management';
import { Loading } from '@/components/ui/loading';

export default function UsersAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  } | null>(null);

  const {
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
  } = useUserManagement();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers({
      page: 1,
      limit: 10,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      search: searchTerm || undefined,
    });
  }, [roleFilter, statusFilter, searchTerm, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({
      page: 1,
      limit: 10,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      search: searchTerm || undefined,
    });
  };

  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
      fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        isActive:
          statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
        search: searchTerm || undefined,
      });
    } catch (createError) {
      // Handle error appropriately - could show toast notification instead
      alert(
        `Error creating user: ${createError instanceof Error ? createError.message : 'Unknown error'}`
      );
    }
  };

  const handleEditUser = async (userData: {
    name: string;
    email: string;
    role: UserRole;
  }) => {
    try {
      if (!editingUser) return;
      await updateUser(editingUser.id, userData);
      setEditingUser(null);
      fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        isActive:
          statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
        search: searchTerm || undefined,
      });
    } catch (updateError) {
      alert(
        `Error updating user: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`
      );
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        isActive:
          statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
        search: searchTerm || undefined,
      });
    } catch (toggleError) {
      alert(
        `Error toggling user status: ${
          toggleError instanceof Error ? toggleError.message : 'Unknown error'
        }`
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Using a more controlled confirmation approach
    const confirmed = window.confirm(
      '¿Está seguro de que desea eliminar este usuario?'
    );
    if (confirmed) {
      try {
        await deleteUser(userId);
        fetchUsers({
          page: pagination.page,
          limit: pagination.limit,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          isActive:
            statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
          search: searchTerm || undefined,
        });
      } catch (deleteError) {
        alert(
          `Error deleting user: ${
            deleteError instanceof Error ? deleteError.message : 'Unknown error'
          }`
        );
      }
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers({
      page,
      limit: pagination.limit,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      search: searchTerm || undefined,
    });
  };

  if (loading && !users.length) {
    return (
      <ProtectedPage
        title="Gestión de Usuarios"
        allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}
      >
        <Loading />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage
      title="Gestión de Usuarios"
      allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Administración de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtros y búsqueda */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <form onSubmit={handleSearch} className="flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar usuarios por nombre o email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </form>

                <div className="flex gap-2">
                  <select
                    value={roleFilter}
                    onChange={e =>
                      setRoleFilter(e.target.value as UserRole | 'ALL')
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Todos los roles</option>
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e =>
                      setStatusFilter(
                        e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
                      )
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Todos los estados</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>

                  <Button onClick={() => setShowCreateModal(true)}>
                    Crear Usuario
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Tabla de usuarios */}
              <UserManagementTable
                users={users}
                loading={loading}
                pagination={pagination}
                onEdit={setEditingUser}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteUser}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modales */}
        {showCreateModal && (
          <CreateUserModal
            roles={roles}
            onSubmit={handleCreateUser}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {editingUser && (
          <EditUserModal
            user={editingUser}
            roles={roles}
            onSubmit={handleEditUser}
            onClose={() => setEditingUser(null)}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
