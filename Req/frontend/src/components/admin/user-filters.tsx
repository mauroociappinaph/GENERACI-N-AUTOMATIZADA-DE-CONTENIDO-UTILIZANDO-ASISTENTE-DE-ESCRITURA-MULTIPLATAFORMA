'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: UserRole | 'ALL';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  roles: UserRole[];
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (role: UserRole | 'ALL') => void;
  onStatusFilterChange: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onSearch: (e: React.FormEvent) => void;
  onCreateUser: () => void;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  roles,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onSearch,
  onCreateUser,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <form onSubmit={onSearch} className="flex-1">
        <Input
          type="text"
          placeholder="Buscar usuarios por nombre o email..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </form>

      <div className="flex gap-2">
        <select
          value={roleFilter}
          onChange={e => onRoleFilterChange(e.target.value as UserRole | 'ALL')}
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
            onStatusFilterChange(
              e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
            )
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>

        <Button onClick={onCreateUser}>Crear Usuario</Button>
      </div>
    </div>
  );
}
