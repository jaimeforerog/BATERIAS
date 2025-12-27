import { z } from 'zod';
import { BatteryRemovalReason } from '@/api/types';

export const removalSchema = z.object({
  reason: z.nativeEnum(BatteryRemovalReason, {
    errorMap: () => ({ message: 'Razón de remoción inválida' }),
  }),

  notes: z
    .string()
    .min(1, 'Las observaciones son requeridas')
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .trim(),

  removedBy: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
});

export type RemovalFormData = z.infer<typeof removalSchema>;
