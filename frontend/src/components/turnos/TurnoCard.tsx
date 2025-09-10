import { component$ } from '@builder.io/qwik';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { formatDateForDisplay, formatDateShort, isToday } from '../../lib/utils/date';
import type { TurnoData } from '../../lib/api/client';

export type TurnoCardProps = {
  turno: TurnoData | null;
  fecha: string | Date;
  showDate?: boolean;
  compact?: boolean;
};

export const TurnoCard = component$<TurnoCardProps>(({
  turno,
  fecha,
  showDate = true,
  compact = false
}) => {
  // Parsear fecha para formateo
  const fechaObj = typeof fecha === 'string'
    ? new Date(fecha + 'T00:00:00')
    : fecha;
  const fechaDisplay = showDate ? formatDateForDisplay(fechaObj) : '';
  const fechaShort = formatDateShort(fechaObj);
  const esHoy = isToday(fechaObj);
  console.log(turno);

  if (!turno) {
    return (
      <Card class={`text-center ${esHoy ? 'ring-2 ring-blue-500' : ''}`}>
        {showDate && (
          <div class="mb-3">
            <h3 class={`text-lg font-semibold ${esHoy ? 'text-blue-600' : 'text-gray-900'}`}>
              {fechaDisplay}
            </h3>
            {esHoy && <span class="text-sm text-blue-600 font-medium">HOY</span>}
          </div>
        )}
        <div class="text-gray-500">
          <p class="text-lg">Sin turno asignado</p>
          <p class="text-sm mt-1">No hay información disponible</p>
        </div>
      </Card>
    );
  }

  const turnoVariant = turno.esVacaciones ? 'libre' :
    turno.turno === 'mañana' ? 'manana' :
      turno.turno === 'tarde' ? 'tarde' :
        turno.turno === 'noche' ? 'noche' : 'default';

  const turnoLabel = turno.esVacaciones ? 'Libre' :
    turno.turno ? turno.turno.charAt(0).toUpperCase() + turno.turno.slice(1) :
      'Sin turno';

  // if (compact) {
  //   return (
  //     <div class={`p-3 rounded-lg border ${esHoy ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}>
  //       <div class="flex items-center justify-between mb-2">
  //         <span class="text-sm font-medium text-gray-900">{fechaShort}</span>
  //         {esHoy && <span class="text-xs text-blue-600 font-medium">HOY</span>}
  //       </div>
  //       <Chip variant={turnoVariant} size="sm">
  //         {turnoLabel}
  //       </Chip>
  //       {turno.notas && (
  //         <p class="text-xs text-gray-600 mt-1 truncate">{turno.notas}</p>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <Card class={`flex flex-col gap-2 min-h-[95px] ${esHoy ? 'ring-2 ring-blue-500' : ''}`}>
      <div class="flex items-center justify-between">
        {showDate && (
          <div class="flex items-center">
            <h3 class={`text-xl font-semibold ${esHoy ? 'text-blue-600' : 'text-gray-900'}`}>
              {fechaShort}
            </h3>
            {/* {esHoy && <span class="text-sm text-blue-600 font-medium">HOY</span>} */}
          </div>

        )}
        {turno &&
          <Chip variant={turnoVariant}>
            {turnoLabel}
          </Chip>
        }
      </div>

      {turno ? (
        <div class="space-y-2">
          {/* Shift times */}
          {turno.startShift && turno.endShift && (
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Horario:</span>
              <p class="text-sm text-gray-900 font-medium">
                {turno.startShift} - {turno.endShift}
              </p>
            </div>
          )}
          
          {/* Notes */}
          {turno.notas && (
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Notas:</span>
              <p class="text-sm text-gray-900">{turno.notas}</p>
            </div>
          )}
        </div>
      ) :
        <div class="text-gray-500">
          <p class="text-lg">Sin turno asignado</p>
          <p class="text-sm mt-1">No hay información disponible</p>
        </div>
      }
    </Card>
  );
});
