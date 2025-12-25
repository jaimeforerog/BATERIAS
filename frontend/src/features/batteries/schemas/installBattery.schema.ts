import { z } from 'zod';

export const installBatterySchema = z.object({
  batteryId: z
    .string()
    .uuid('El ID de la batería es inválido'),

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

  equipoId: z
    .number()
    .int('El ID del equipo debe ser un número entero')
    .positive('El ID del equipo debe ser un número positivo'),

  equipoCodigo: z
    .string()
    .min(1, 'El código del equipo es requerido')
    .max(50, 'El código del equipo no puede exceder 50 caracteres')
    .trim(),

  equipoPlaca: z
    .string()
    .min(1, 'La placa del equipo es requerida')
    .max(20, 'La placa no puede exceder 20 caracteres')
    .trim(),

  equipoDescripcion: z
    .string()
    .min(1, 'La descripción del equipo es requerida')
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .trim(),

  initialVoltage: z
    .number()
    .positive('El voltaje debe ser un número positivo')
    .refine(
      (voltage) => voltage >= 10 && voltage <= 15,
      'El voltaje típico de una batería está entre 10V y 15V. Verifica el valor ingresado.'
    ),

  installedBy: z
    .string()
    .min(1, 'El nombre de quien instala es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
});

export type InstallBatteryFormData = z.infer<typeof installBatterySchema>;
