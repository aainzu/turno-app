import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { turnosService } from '../turnos.service';
import { turnosRepository } from '../../repositories/turnos.repo';

// Mock del repositorio
vi.mock('../../repositories/turnos.repo', () => ({
  turnosRepository: {
    findByFecha: vi.fn(),
    upsert: vi.fn(),
    bulkUpsert: vi.fn(),
    getStats: vi.fn(),
  },
}));

const mockRepository = turnosRepository as {
  findByFecha: Mock;
  upsert: Mock;
  bulkUpsert: Mock;
  getStats: Mock;
};

describe('TurnosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateExcelFile', () => {
    it('should validate valid Excel file', () => {
      const mockFile = {
        name: 'turnos.xlsx',
        size: 1024 * 1024, // 1MB
      } as File;

      const result = turnosService.validateExcelFile(mockFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-Excel files', () => {
      const mockFile = {
        name: 'turnos.txt',
        size: 1024,
      } as File;

      const result = turnosService.validateExcelFile(mockFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Solo se permiten archivos Excel (.xlsx)');
    });

    it('should reject files that are too large', () => {
      const mockFile = {
        name: 'turnos.xlsx',
        size: 10 * 1024 * 1024, // 10MB
      } as File;

      const result = turnosService.validateExcelFile(mockFile);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('demasiado grande');
    });

    it('should reject empty files', () => {
      const mockFile = {
        name: 'turnos.xlsx',
        size: 0,
      } as File;

      const result = turnosService.validateExcelFile(mockFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('está vacío');
    });
  });

  describe('processExcelData', () => {
    it('should process valid Excel data successfully', async () => {
      const mockExcelData = [
        {
          fecha: '2025-09-03',
          turno: 'mañana',
          vacaciones: false,
          notas: 'Cobertura',
        },
      ];

      const mockResult = {
        inserted: 1,
        updated: 0,
        skipped: 0,
        items: [],
      };

      mockRepository.bulkUpsert.mockResolvedValue(mockResult);

      const result = await turnosService.processExcelData(mockExcelData);

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle Excel data with warnings', async () => {
      const mockExcelData = [
        {
          fecha: '2025-09-03',
          turno: 'mañana',
          vacaciones: true, // Turno y vacaciones al mismo tiempo
          notas: '',
        },
      ];

      const mockResult = {
        inserted: 1,
        updated: 0,
        skipped: 0,
        items: [],
      };

      mockRepository.bulkUpsert.mockResolvedValue(mockResult);

      const result = await turnosService.processExcelData(mockExcelData);

      expect(result.warnings).toContain('Se especificó turno y vacaciones');
    });

    it('should handle invalid Excel data', async () => {
      const mockExcelData = [
        {
          fecha: 'invalid-date',
          turno: 'mañana',
          vacaciones: false,
          notas: '',
        },
      ];

      const result = await turnosService.processExcelData(mockExcelData);

      expect(result.inserted).toBe(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Formato de fecha');
    });
  });

  describe('getTurnoByFecha', () => {
    it('should return turno when found', async () => {
      const mockTurno = {
        id: 1,
        fecha: '2025-09-03',
        turno: 'mañana',
        esVacaciones: false,
        notas: 'Test',
        updatedAt: new Date(),
      };

      mockRepository.findByFecha.mockResolvedValue(mockTurno);

      const result = await turnosService.getTurnoByFecha('2025-09-03');

      expect(result).toEqual(mockTurno);
      expect(mockRepository.findByFecha).toHaveBeenCalledWith('2025-09-03');
    });

    it('should return null when turno not found', async () => {
      mockRepository.findByFecha.mockResolvedValue(null);

      const result = await turnosService.getTurnoByFecha('2025-09-03');

      expect(result).toBeNull();
    });
  });

  describe('upsertTurno', () => {
    it('should upsert turno successfully', async () => {
      const turnoData = {
        fecha: '2025-09-03',
        turno: 'mañana' as const,
        esVacaciones: false,
        notas: 'Test turno',
      };

      const mockResult = {
        id: 1,
        ...turnoData,
        updatedAt: new Date(),
      };

      mockRepository.upsert.mockResolvedValue(mockResult);

      const result = await turnosService.upsertTurno(turnoData);

      expect(result).toEqual(mockResult);
      expect(mockRepository.upsert).toHaveBeenCalledWith(turnoData);
    });

    it('should validate turno data', async () => {
      const invalidData = {
        fecha: 'invalid-date',
        turno: 'mañana' as const,
        esVacaciones: false,
      };

      await expect(turnosService.upsertTurno(invalidData)).rejects.toThrow('Datos inválidos');
    });

    it('should prevent turno and vacaciones at the same time', async () => {
      const invalidData = {
        fecha: '2025-09-03',
        turno: 'mañana' as const,
        esVacaciones: true,
      };

      await expect(turnosService.upsertTurno(invalidData)).rejects.toThrow(
        'No se puede tener un turno específico y marcar como vacaciones'
      );
    });
  });

  describe('getTurnosStats', () => {
    it('should return stats successfully', async () => {
      const mockStats = {
        total: 10,
        porTurno: { mañana: 5, tarde: 3, noche: 2 },
        vacaciones: 0,
      };

      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await turnosService.getTurnosStats();

      expect(result).toEqual(mockStats);
      expect(mockRepository.getStats).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return stats with date range', async () => {
      const mockStats = {
        total: 5,
        porTurno: { mañana: 3, tarde: 2 },
        vacaciones: 0,
      };

      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await turnosService.getTurnosStats('2025-09-01', '2025-09-30');

      expect(result).toEqual(mockStats);
      expect(mockRepository.getStats).toHaveBeenCalledWith('2025-09-01', '2025-09-30');
    });
  });
});
