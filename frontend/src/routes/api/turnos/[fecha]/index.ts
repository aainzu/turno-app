import { routeLoader$ } from '@builder.io/qwik-city';
import { turnosService } from '../../../../lib/services/turnos.service';
import { validateAndParse, fechaParamSchema } from '../../../../lib/validators';

// GET /api/turnos/[fecha] - Obtener turno específico por fecha
export const GET = routeLoader$(async (requestEvent) => {
  try {
    const { fecha } = requestEvent.params;

    // Validar parámetro de fecha
    const validation = validateAndParse(fechaParamSchema, { fecha });
    if (!validation.success) {
      return requestEvent.json({
        error: 'Fecha inválida',
        details: validation.errors
      }, { status: 400 });
    }

    // Obtener turno por fecha
    const turno = await turnosService.getTurnoByFecha(fecha);

    if (!turno) {
      return requestEvent.json({
        error: 'No se encontró turno para la fecha especificada',
        fecha
      }, { status: 404 });
    }

    return requestEvent.json(turno, { status: 200 });

  } catch (error) {
    console.error(`Error en GET /api/turnos/${requestEvent.params.fecha}:`, error);

    return requestEvent.json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
});
