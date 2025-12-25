import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a formato español dd/MM/yyyy HH:mm
 */
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
};

/**
 * Formatea una fecha a formato corto dd/MM/yyyy
 */
export const formatDateShort = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
};

/**
 * Formatea una fecha de manera relativa (hace X tiempo)
 */
export const formatRelativeDate = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  });
};

/**
 * Formatea un voltaje con 2 decimales y sufijo V
 */
export const formatVoltage = (voltage: number): string => {
  return `${voltage.toFixed(2)}V`;
};

/**
 * Formatea un porcentaje con 1 decimal
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Formatea un número con separador de miles
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES').format(value);
};
