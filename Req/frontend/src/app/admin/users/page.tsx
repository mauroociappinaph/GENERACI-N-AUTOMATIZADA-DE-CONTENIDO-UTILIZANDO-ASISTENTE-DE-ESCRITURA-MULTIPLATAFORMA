'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, User } from '@/types';
import { UserManagementTable } from '@/components/admin/user-management-table';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { UserFilters } from '@/components/admin/user-filters';
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog';
import { useUserManagement } from '@/hooks/use-user-management';
import { useUserFilters } from '@/hooks/use-user-filters';
import { useUserActions } from '@/hooks/use-user-actions';
import { Loading } from '@/components/ui/loading';

export default function UsersAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { users, loading, error, pagination, roles, fetchRoles } =
    useUserManagement();

  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    buildCurrentPageFetchParams,
    handleSearch,
    handlePageChange,
  } = useUserFilters();

  const {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleCreateUser: createUserAction,
    handleEditUser: editUserAction,
    handleToggleStatus,
    handleDeleteUser,
    confirmDeleteUser,
  } = useUserActions();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateUser = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => {
    await createUserAction(userData, buildCurrentPageFetchParams(), () => {
      setShowCreateModal(false);
    });
  };

  const handleEditUser = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  }) => {
    if (!editingUser) return;

    await editUserAction(
      editingUser.id,
      userData,
      buildCurrentPageFetchParams(),
      () => {
        setEditingUser(null);
      }
    );
  };

  const handleToggleUserStatus = async (userId: string) => {
    await handleToggleStatus(userId, buildCurrentPageFetchParams());
  };

  const handleConfirmDeleteUser = async () => {
    await confirmDeleteUser(buildCurrentPageFetchParams());
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
              <UserFilters
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                roles={roles}
                onSearchChange={setSearchTerm}
                onRoleFilterChange={setRoleFilter}
                onStatusFilterChange={setStatusFilter}
                onSearch={handleSearch}
                onCreateUser={() => setShowCreateModal(true)}
              />

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
                onToggleStatus={handleToggleUserStatus}
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

        {/* Diálogo de confirmación de eliminación */}
        <DeleteUserDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleConfirmDeleteUser}
        />
      </div>
    </ProtectedPage>
  );
}
