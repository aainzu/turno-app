import { routeLoader$ } from '@builder.io/qwik-city';
import { turnosService } from '../../../lib/services/turnos.service';
import { validateAndParse, turnoQuerySchema } from '../../../lib/validators';

// GET /api/turnos - Obtener turnos por rango de fechas
export const GET = routeLoader$(async (requestEvent) => {
  try {
    const url = new URL(requestEvent.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // Si no hay rango especificado, devolver error
    if (!from || !to) {
      return requestEvent.json({
        error: 'Parámetros requeridos: from y to (formato YYYY-MM-DD)',
        example: '/api/turnos?from=2025-01-01&to=2025-01-31'
      }, { status: 400 });
    }

    // Validar parámetros
    const validation = validateAndParse(turnoQuerySchema, { from, to });
    if (!validation.success) {
      return requestEvent.json({
        error: 'Parámetros inválidos',
        details: validation.errors
      }, { status: 400 });
    }

    // Obtener turnos del rango
    const result = await turnosService.getTurnosByRange(from, to);

    return requestEvent.json(result, { status: 200 });

  } catch (error) {
    console.error('Error en GET /api/turnos:', error);

    return requestEvent.json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
});
