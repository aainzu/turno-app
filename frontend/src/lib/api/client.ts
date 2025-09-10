// API Client for communicating with the backend
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TurnoData {
  id: string;
  fecha: string;
  turno?: 'mañana' | 'tarde' | 'noche';
  startShift?: string; // HH:MM format
  endShift?: string; // HH:MM format
  esVacaciones: boolean;
  notas?: string;
  personaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TurnosResponse {
  items: TurnoData[];
  total: number;
}

export interface BulkUploadResult {
  inserted: number;
  updated: number;
  skipped: number;
  warnings: string[];
  items: TurnoData[];
}

export interface TurnoStats {
  total: number;
  porTurno: Record<string, number>;
  vacaciones: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Error en la solicitud',
          message: data.message,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Error de conexión con el servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Get turnos by date range
  async getTurnos(from: string, to: string, personaId?: string): Promise<ApiResponse<TurnosResponse>> {
    const params = new URLSearchParams({ from, to });
    if (personaId) params.append('personaId', personaId);
    
    return this.request<TurnosResponse>(`/turnos?${params}`);
  }

  // Get turno by specific date
  async getTurnoByFecha(fecha: string, personaId?: string): Promise<ApiResponse<TurnoData>> {
    const params = personaId ? `?personaId=${personaId}` : '';
    return this.request<TurnoData>(`/turnos/${fecha}${params}`);
  }

  // Get today's turno
  async getTodayTurno(personaId?: string): Promise<ApiResponse<TurnoData>> {
    const params = personaId ? `?personaId=${personaId}` : '';
    return this.request<TurnoData>(`/turnos/today${params}`);
  }

  // Create or update turno
  async upsertTurno(turnoData: {
    fecha: string;
    turno?: 'mañana' | 'tarde' | 'noche';
    startShift?: string;
    endShift?: string;
    esVacaciones: boolean;
    notas?: string;
    personaId?: string;
  }): Promise<ApiResponse<TurnoData>> {
    return this.request<TurnoData>('/turnos', {
      method: 'POST',
      body: JSON.stringify(turnoData),
    });
  }

  // Upload Excel file
  async uploadExcel(file: File): Promise<ApiResponse<{
    success: boolean;
    message: string;
    details: BulkUploadResult;
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/turnos/excel', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  // Get turno statistics
  async getTurnosStats(from?: string, to?: string): Promise<ApiResponse<TurnoStats>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request<TurnoStats>(`/turnos/stats${query}`);
  }

  // Cleanup old data
  async cleanupOldData(daysOld?: number): Promise<ApiResponse<{
    success: boolean;
    message: string;
    deletedCount: number;
  }>> {
    const params = daysOld ? `?daysOld=${daysOld}` : '';
    return this.request(`/turnos/cleanup${params}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    version: string;
  }>> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
