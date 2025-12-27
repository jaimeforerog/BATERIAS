import { z } from 'zod';
import { MaintenanceType, HealthStatus } from '@/api/types';

export const maintenanceSchema = z.object({
  maintenanceDate: z
    .string()
    .min(1, 'La fecha del mantenimiento es requerida')
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      'La fecha del mantenimiento no es válida'
    ),

  type: z.number().refine(
    (val) => Object.values(MaintenanceType).includes(val as any),
    'Tipo de mantenimiento inválido'
  ),

  voltageReading: z
    .number()
    .positive('El voltaje debe ser un número positivo')
    .refine(
      (voltage) => voltage >= 8 && voltage <= 16,
      'El voltaje debe estar entre 8V y 16V'
    ),

  healthStatus: z.number().refine(
    (val) => Object.values(HealthStatus).includes(val as any),
    'Estado de salud inválido'
  ),

  notes: z
    .string()
    .min(1, 'Las observaciones son requeridas')
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .trim(),

  performedBy: z
    .string()
    .min(1, 'El nombre del técnico es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
