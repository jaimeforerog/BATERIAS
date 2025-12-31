export interface AuditLogEntry {
  id: string;
  batteryId: string;
  serialNumber: string;
  eventType: string;
  eventTimestamp: string;
  performedBy: string;
  equipoCodigo?: string | null;
  equipoId?: number | null;
  voltageReading?: number | null;
  healthStatus?: string | null;
  maintenanceType?: string | null;
  removalReason?: string | null;
  disposalReason?: string | null;
  notes?: string | null;
  model?: string | null;
  brand?: string | null;
  eventDescription: string;
}

export interface AuditEventResponse {
  events: AuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  performedBy?: string;
  serialNumber?: string;
  eventType?: string;
}
