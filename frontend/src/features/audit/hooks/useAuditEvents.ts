import { useQuery } from '@tanstack/react-query';
import { getAuditEvents } from '@/api/audit.api';
import type { AuditFilters } from '../types/audit.types';

export const useAuditEvents = (filters: AuditFilters, page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['auditEvents', filters, page, pageSize],
    queryFn: () => getAuditEvents(filters, page, pageSize),
    staleTime: 30000, // 30 seconds
  });
};
