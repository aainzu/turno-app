import { z } from 'zod';

// Validadores para parámetros de API
export const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha from debe ser YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha to debe ser YYYY-MM-DD'),
});

export const fechaParamSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
});

export const turnoQuerySchema = z.object({
  turno: z.enum(['mañana', 'tarde', 'noche']).optional(),
  esVacaciones: z.string().transform(val => val === 'true').optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// Validador para upload de archivos
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size > 0, 'El archivo no puede estar vacío')
    .refine((file) => file.size < 5 * 1024 * 1024, 'El archivo es demasiado grande (máx 5MB)')
    .refine((file) => file.name.toLowerCase().endsWith('.xlsx'), 'Solo se permiten archivos .xlsx'),
});

// Tipos inferidos
export type DateRangeParams = z.infer<typeof dateRangeSchema>;
export type FechaParam = z.infer<typeof fechaParamSchema>;
export type TurnoQueryParams = z.infer<typeof turnoQuerySchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;

// Función helper para validar y parsear parámetros
export function validateAndParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      success: false,
      errors: ['Error de validación desconocido']
    };
  }
}
