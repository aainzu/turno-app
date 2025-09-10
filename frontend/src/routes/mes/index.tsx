import { component$, $ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { MainLayout } from "../../components/layout/MainLayout";
import { TurnoCard } from "../../components/turnos/TurnoCard";
import { DateNavigation } from "../../components/turnos/DateNavigation";
import { getLocalizedDate, getCalendarDates, LocalizedDate } from "../../lib/utils/date";
import { turnosService } from "../../lib/services/turnos.service";
import type { DocumentHead } from "@builder.io/qwik-city";

// Loader para obtener turnos del mes
export const useMonthTurnos = routeLoader$(async (requestEvent) => {
  try {
    // Obtener fecha desde query params o usar hoy por defecto
    const dateParam = requestEvent.url.searchParams.get('fecha');
    let targetDate: LocalizedDate;

    if (dateParam) {
      try {
        targetDate = LocalizedDate.fromISO(dateParam);
      } catch {
        // Si la fecha del parámetro es inválida, usar hoy
        targetDate = getLocalizedDate();
      }
    } else {
      targetDate = getLocalizedDate();
    }

    const { dates, monthStart, monthEnd } = getCalendarDates(targetDate);

    // Obtener turnos del rango de fechas del mes
    const fromDate = monthStart.formatISO();
    const toDate = monthEnd.formatISO();

    const turnosResult = await turnosService.getTurnosByRange(fromDate, toDate);

    // Crear un mapa para acceso rápido a los turnos por fecha
    const turnosMap = new Map();
    turnosResult?.items.forEach(turno => {
      turnosMap.set(turno.fecha, turno);
    });

    // Mapear las fechas con sus turnos correspondientes
    const turnos = dates.map(date => {
      const turno = turnosMap.get(date.formatISO());
      return {
        fecha: date.formatISO(),
        turno: turno || null,
      };
    });

    return {
      dates: dates.map(date => ({
        year: date.year,
        month: date.month,
        day: date.day,
        formatISO: date.formatISO(),
        formatForDisplay: date.formatForDisplay(),
        formatShort: date.formatShort(),
      })),
      monthStart: {
        year: monthStart.year,
        month: monthStart.month,
        day: monthStart.day,
      },
      monthEnd: {
        year: monthEnd.year,
        month: monthEnd.month,
        day: monthEnd.day,
      },
      turnos,
      currentDate: {
        year: targetDate.year,
        month: targetDate.month,
        day: targetDate.day,
        formatISO: targetDate.formatISO(),
        formatForDisplay: targetDate.formatForDisplay(),
        formatShort: targetDate.formatShort(),
      },
    };
  } catch (error) {
    console.error('Error cargando turnos del mes:', error);
    const fallbackDate = getLocalizedDate();
    return {
      dates: [],
      monthStart: {
        year: fallbackDate.year,
        month: fallbackDate.month,
        day: fallbackDate.day,
      },
      monthEnd: {
        year: fallbackDate.year,
        month: fallbackDate.month,
        day: fallbackDate.day,
      },
      turnos: [],
      currentDate: {
        year: fallbackDate.year,
        month: fallbackDate.month,
        day: fallbackDate.day,
        formatISO: fallbackDate.formatISO(),
        formatForDisplay: fallbackDate.formatForDisplay(),
        formatShort: fallbackDate.formatShort(),
      },
      error: 'Error al cargar los turnos del mes',
    };
  }
});

export default component$(() => {
  const monthData = useMonthTurnos();
  const navigate = useNavigate();

  const navigateToMonth = $((dateISO: string) => {
    navigate(`/mes?fecha=${dateISO}`);
  });

  const navigateToPreviousMonth = $(() => {
    const currentDate = LocalizedDate.fromISO(monthData.value.currentDate.formatISO);
    // Ir al primer día del mes anterior
    const previousMonth = currentDate.with({ day: 1 }).subtractDays(1).with({ day: 1 });
    navigateToMonth(previousMonth.formatISO());
  });

  const navigateToNextMonth = $(() => {
    const currentDate = LocalizedDate.fromISO(monthData.value.currentDate.formatISO);
    // Ir al primer día del mes siguiente
    const nextMonth = currentDate.with({ day: currentDate.daysInMonth }).addDays(1).with({ day: 1 });
    navigateToMonth(nextMonth.formatISO());
  });

  const navigateToCurrentMonth = $(() => {
    navigate('/mes');
  });

  // Nombres de los días de la semana
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <MainLayout>
      <div class="max-w-7xl mx-auto pb-32 md:pb-0">

        {/* Desktop Navigation */}
        <DateNavigation
          currentDate={new Date(monthData.value.currentDate.formatISO + 'T00:00:00')}
          onPrevious$={navigateToPreviousMonth}
          onNext$={navigateToNextMonth}
          onToday$={navigateToCurrentMonth}
          previousLabel="Mes anterior"
          nextLabel="Mes siguiente"
          className="!hidden md:!flex"
        />

        {monthData.value.error ? (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error al cargar datos</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{monthData.value.error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div class="mt-6 md:mt-0 mx-4 md:mx-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header con días de la semana */}
            <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {dayNames.map((dayName) => (
                <div
                  key={dayName}
                  class="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Grid del calendario */}
            <div class="grid grid-cols-7">
              {monthData.value.dates.map((date, index) => {
                const isCurrentMonth = date.year === monthData.value.monthStart.year &&
                  date.month === monthData.value.monthStart.month;
                // Verificar si es el día actual real (hoy)
                const today = getLocalizedDate();
                const isToday = date.year === today.year &&
                  date.month === today.month &&
                  date.day === today.day;

                return (
                  <div
                    key={date.formatISO}
                    class={`md:min-h-[120px] min-h-[80px] border-r border-b border-gray-200 last:border-r-0 p-1 md:p-2 ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                      } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div class="flex items-center justify-between mb-1 md:mb-2">
                      <span class={`text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isToday ? 'text-blue-600' : ''}`}>
                        {date.day}
                      </span>
                      {isToday && (
                        <span class="text-[10px] md:text-xs text-blue-600 font-medium">HOY</span>
                      )}
                    </div>

                    {/* Turno del día */}
                    <div class="text-xs">
                      {(() => {
                        const turnoData = monthData.value.turnos.find(t => t.fecha === date.formatISO);
                        const turno = turnoData?.turno;

                        if (!isCurrentMonth) return null;

                        if (!turno) {
                          return <div class="text-gray-500 text-[10px] md:text-xs">Sin turno</div>;
                        }

                        if (turno.esVacaciones) {
                          return (
                            <div class="bg-red-100 text-red-800 px-1 md:px-2 py-1 rounded">
                              <p class="hidden md:block text-[10px] md:text-xs">{turno.notas || 'Vacaciones'}</p>
                              <div class="md:hidden w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          );
                        }

                        const turnoColors = {
                          'mañana': 'bg-emerald-100 text-emerald-800',
                          'tarde': 'bg-amber-100 text-amber-800',
                          'noche': 'bg-blue-100 text-blue-800'
                        };

                        const colorClass = turnoColors[turno.turno as keyof typeof turnoColors] || 'bg-gray-100 text-gray-800';

                        return (
                          <div class={`${colorClass} px-1 md:px-2 py-1 rounded`}>
                            <p class="hidden md:block text-[10px] md:text-xs capitalize">{turno.turno}</p>
                            <div class={`md:hidden w-2 h-2 rounded-full ${
                              turno.turno === 'mañana' ? 'bg-emerald-500' :
                              turno.turno === 'tarde' ? 'bg-amber-500' :
                              turno.turno === 'noche' ? 'bg-blue-500' : 'bg-gray-500'
                            }`}></div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leyenda - Solo visible en desktop */}
        <div class="mt-6 hidden md:flex flex-wrap items-center justify-center gap-4 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
            <span>Mañana</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
            <span>Tarde</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Noche</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Vacaciones</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
            <span>Hoy</span>
          </div>
        </div>
        
        {/* Mobile Legend - Compact version */}
        <div class="mt-4 md:hidden flex flex-wrap items-center justify-center gap-3 text-xs px-4">
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>Mañana</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Tarde</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Noche</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Vacaciones</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation - Fixed above main navigation */}
      <div class="md:hidden fixed bottom-16 left-0 right-0 bg-white p-2 z-10">
        <DateNavigation
          currentDate={new Date(monthData.value.currentDate.formatISO + 'T00:00:00')}
          onPrevious$={navigateToPreviousMonth}
          onNext$={navigateToNextMonth}
          onToday$={navigateToCurrentMonth}
          compact={true}
          previousLabel="Anterior"
          nextLabel="Siguiente"
        />
      </div>
    </MainLayout>
  );
});

export const head: DocumentHead = {
  title: "Mi Turno - Vista Mensual",
  meta: [
    {
      name: "description",
      content: "Visualiza el calendario completo del mes con todos tus turnos",
    },
  ],
};
