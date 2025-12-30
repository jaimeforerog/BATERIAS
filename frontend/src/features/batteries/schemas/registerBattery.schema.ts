import { z } from 'zod';

export const registerBatterySchema = z.object({
  serialNumber: z
    .string()
    .min(1, 'El número de serie es requerido')
    .max(50, 'El número de serie no puede exceder 50 caracteres')
    .trim(),

  model: z
    .string()
    .min(1, 'El modelo es requerido')
    .max(100, 'El modelo no puede exceder 100 caracteres')
    .trim(),

  brandId: z
    .number()
    .int('La marca debe ser un número entero')
    .min(1, 'La marca es requerida')
    .max(18, 'Marca inválida'),

  registrationDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Fecha de registro inválida',
    }),

  registeredBy: z
    .string()
    .min(1, 'El nombre de quien registra es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
});

export type RegisterBatteryFormData = z.infer<typeof registerBatterySchema>;
