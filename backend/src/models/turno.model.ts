import { z } from 'zod';

// Turno types
export type TurnoType = 'mañana' | 'tarde' | 'noche';

// Base Turno interface for CosmosDB
export interface TurnoDocument {
  id: string; // CosmosDB document id
  fecha: string; // YYYY-MM-DD format (also partition key)
  turno?: TurnoType;
  esVacaciones: boolean;
  notas?: string;
  personaId?: string; // For future multi-user support
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  _rid?: string; // CosmosDB resource id
  _self?: string; // CosmosDB self link
  _etag?: string; // CosmosDB etag
  _attachments?: string; // CosmosDB attachments
  _ts?: number; // CosmosDB timestamp
}

// Input validation schemas
export const turnoInsertSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
  turno: z.enum(['mañana', 'tarde', 'noche']).optional(),
  esVacaciones: z.boolean().default(false),
  notas: z.string().optional().default(''),
  personaId: z.string().optional(),
});

export const turnoUpdateSchema = turnoInsertSchema.partial();

export const turnoQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
  personaId: z.string().optional(),
});

// Excel row validation schema
export const excelRowSchema = z.object({
  fecha: z.string().transform((val) => {
    // Normalize date input
    const cleaned = val.trim();
    // Handle various date formats and convert to YYYY-MM-DD
    const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const match = cleaned.match(dateRegex);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return cleaned;
    }
    throw new Error(`Invalid date format: ${cleaned}`);
  }),
  turno: z.string().optional().transform((val) => val?.toLowerCase().trim()),
  vacaciones: z.union([
    z.string(),
    z.number(),
    z.boolean()
  ]).transform((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'sí' || lower === 'si' || lower === 'true' || lower === '1';
    }
    return false;
  }),
  notas: z.string().optional().transform((val) => val?.trim() || ''),
});

// Type exports
export type TurnoInsert = z.infer<typeof turnoInsertSchema>;
export type TurnoUpdate = z.infer<typeof turnoUpdateSchema>;
export type TurnoQuery = z.infer<typeof turnoQuerySchema>;
export type ExcelRow = z.infer<typeof excelRowSchema>;

// Utility function to generate document ID
export function generateTurnoId(fecha: string, personaId?: string): string {
  return personaId ? `${fecha}_${personaId}` : fecha;
}

// Utility function to create a new turno document
export function createTurnoDocument(data: TurnoInsert): TurnoDocument {
  const now = new Date().toISOString();
  return {
    id: generateTurnoId(data.fecha, data.personaId),
    fecha: data.fecha,
    turno: data.turno,
    esVacaciones: data.esVacaciones,
    notas: data.notas || '',
    personaId: data.personaId,
    createdAt: now,
    updatedAt: now,
  };
}
