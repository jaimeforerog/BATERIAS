import { z } from 'zod';

export const disposalSchema = z.object({
  disposalDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Fecha de desecho inválida',
    }),

  disposalReason: z
    .string()
    .min(1, 'La razón de desecho es requerida')
    .max(200, 'La razón no puede exceder 200 caracteres')
    .trim(),

  notes: z
    .string()
    .min(1, 'Las observaciones son requeridas')
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .trim(),

  disposedBy: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
});

export type DisposalFormData = z.infer<typeof disposalSchema>;
