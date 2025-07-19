'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/types';
import { useUserManagement } from './use-user-management';

export function useUserFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL');

  const { fetchUsers, pagination } = useUserManagement();

  const buildFetchParams = useCallback(() => {
    return {
      page: 1,
      limit: 10,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      search: searchTerm || undefined,
    };
  }, [roleFilter, statusFilter, searchTerm]);

  const buildCurrentPageFetchParams = useCallback(() => {
    return {
      page: pagination.page,
      limit: pagination.limit,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      search: searchTerm || undefined,
    };
  }, [roleFilter, statusFilter, searchTerm, pagination]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(buildFetchParams());
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

  // Auto-fetch when filters change
  useEffect(() => {
    fetchUsers(buildFetchParams());
  }, [roleFilter, statusFilter, searchTerm, fetchUsers, buildFetchParams]);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    buildFetchParams,
    buildCurrentPageFetchParams,
    handleSearch,
    handlePageChange,
  };
}
