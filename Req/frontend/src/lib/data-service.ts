import { ApiResponse, DataRecord, SearchCriteria } from '@/types';
import { apiClient } from './api';

export interface DataRecordListResponse {
  records: DataRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DataRecordFilters {
  type?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export class DataService {
  private basePath = '/api/data-records';

  async getRecords(
    criteria: SearchCriteria
  ): Promise<ApiResponse<DataRecordListResponse>> {
    const params = new URLSearchParams();

    if (criteria.query) params.append('query', criteria.query);
    if (criteria.sortBy) params.append('sortBy', criteria.sortBy);
    if (criteria.sortOrder) params.append('sortOrder', criteria.sortOrder);
    params.append('page', criteria.page.toString());
    params.append('limit', criteria.limit.toString());

    // Add filters
    Object.entries(criteria.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return apiClient.get<DataRecordListResponse>(
      `${this.basePath}?${params.toString()}`
    );
  }

  async getRecord(id: string): Promise<ApiResponse<DataRecord>> {
    return apiClient.get<DataRecord>(`${this.basePath}/${id}`);
  }

  async createRecord(
    data: Partial<DataRecord>
  ): Promise<ApiResponse<DataRecord>> {
    return apiClient.post<DataRecord>(this.basePath, data);
  }

  async updateRecord(
    id: string,
    data: Partial<DataRecord>
  ): Promise<ApiResponse<DataRecord>> {
    return apiClient.put<DataRecord>(`${this.basePath}/${id}`, data);
  }

  async updateRecordWithVersion(
    id: string,
    data: Partial<DataRecord>,
    expectedVersion: number
  ): Promise<ApiResponse<DataRecord>> {
    return apiClient.put<DataRecord>(`${this.basePath}/${id}`, {
      ...data,
      expectedVersion,
    });
  }

  async checkForConflicts(
    id: string,
    lastKnownVersion: number
  ): Promise<
    ApiResponse<{ hasConflict: boolean; currentRecord?: DataRecord }>
  > {
    return apiClient.get<{ hasConflict: boolean; currentRecord?: DataRecord }>(
      `${this.basePath}/${id}/conflict-check?version=${lastKnownVersion}`
    );
  }

  async deleteRecord(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async getRecordTypes(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${this.basePath}/types`);
  }

  async getRecordHistory(id: string): Promise<ApiResponse<DataRecord[]>> {
    return apiClient.get<DataRecord[]>(`${this.basePath}/${id}/history`);
  }
}

export const dataService = new DataService();
