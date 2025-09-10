import { apiClient, type TurnoData, type TurnosResponse, type BulkUploadResult, type TurnoStats } from '../api/client';
import { getLocalizedDate } from '../utils/date';
import { z } from 'zod';

// Re-export types for backward compatibility
export type { BulkUploadResult as BulkResult, TurnoData, TurnosResponse, TurnoStats };

// Tipos de turno válidos
export type TurnoType = 'mañana' | 'tarde' | 'noche';

// Input validation schemas (moved to backend, kept for compatibility)
export interface TurnoInsert {
  fecha: string;
  turno?: TurnoType;
  startShift?: string;
  endShift?: string;
  esVacaciones: boolean;
  notas?: string;
  personaId?: string;
}

export interface ExcelRow {
  fecha: string;
  turno?: string;
  vacaciones: boolean;
  notas?: string;
}

// Servicio de negocio para turnos
export class TurnosService {
  // Obtener turno por fecha específica
  async getTurnoByFecha(fecha: string, personaId?: string) {
    try {
      const response = await apiClient.getTurnoByFecha(fecha, personaId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Error obteniendo turno por fecha:', error);
      throw new Error('Error al obtener el turno');
    }
  }

  // Obtener turnos en un rango de fechas
  async getTurnosByRange(from: string, to: string, personaId?: string) {
    try {
      const response = await apiClient.getTurnos(from, to, personaId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Error obteniendo turnos por rango:', error);
      throw new Error('Error al obtener los turnos');
    }
  }

  // Obtener turno de hoy
  async getTodayTurno(personaId?: string) {
    try {
      const response = await apiClient.getTodayTurno(personaId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Error obteniendo turno de hoy:', error);
      throw new Error('Error al obtener el turno de hoy');
    }
  }

  // Crear o actualizar turno
  async upsertTurno(data: TurnoInsert) {
    try {
      // Business rules validation (backend will also validate)
      if (data.turno && data.esVacaciones) {
        throw new Error('No se puede tener un turno específico y marcar como vacaciones al mismo tiempo');
      }

      // Validate shift times
      if ((data.startShift && !data.endShift) || (!data.startShift && data.endShift)) {
        throw new Error('Debe proporcionar tanto la hora de inicio como la hora de fin del turno, o ninguna de las dos');
      }

      const response = await apiClient.upsertTurno(data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Error upsert turno:', error);
      throw error;
    }
  }

  // Procesar archivo Excel (delegado al backend)
  async processExcelFile(file: File): Promise<BulkUploadResult> {
    try {
      const response = await apiClient.uploadExcel(file);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!.details;
    } catch (error) {
      console.error('Error procesando archivo Excel:', error);
      throw new Error('Error al procesar el archivo Excel');
    }
  }

  // Validar archivo Excel antes de procesar
  validateExcelFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Verificar tamaño del archivo
    if (file.size > maxSize) {
      errors.push('El archivo es demasiado grande. Máximo permitido: 5MB');
    }

    // Verificar tipo de archivo
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      errors.push('Solo se permiten archivos Excel (.xlsx)');
    }

    // Verificar que no esté vacío
    if (file.size === 0) {
      errors.push('El archivo está vacío');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Obtener estadísticas de turnos
  async getTurnosStats(from?: string, to?: string) {
    try {
      const response = await apiClient.getTurnosStats(from, to);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  // Limpiar datos antiguos (mantenimiento)
  async cleanupOldData(daysOld: number = 365): Promise<number> {
    try {
      const response = await apiClient.cleanupOldData(daysOld);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!.deletedCount;
    } catch (error) {
      console.error('Error limpiando datos antiguos:', error);
      throw new Error('Error al limpiar datos antiguos');
    }
  }

  // Verificar si una fecha tiene conflictos (útil para validaciones futuras)
  async checkDateConflicts(fecha: string, personaId?: string): Promise<{
    hasConflict: boolean;
    existingTurno?: TurnoData;
  }> {
    try {
      const existing = await this.getTurnoByFecha(fecha, personaId);
      return {
        hasConflict: !!existing,
        existingTurno: existing || undefined,
      };
    } catch (error) {
      // If error is "not found", it's not a conflict
      return { hasConflict: false };
    }
  }
}

// Instancia singleton del servicio
export const turnosService = new TurnosService();
