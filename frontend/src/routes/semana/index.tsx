import { component$, $ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { MainLayout } from "../../components/layout/MainLayout";
import { TurnoCard } from "../../components/turnos/TurnoCard";
import { DateNavigation } from "../../components/turnos/DateNavigation";
import { getLocalizedDate, getWeekDates, LocalizedDate } from "../../lib/utils/date";
import { turnosService } from "../../lib/services/turnos.service";
import type { DocumentHead } from "@builder.io/qwik-city";

// Loader para obtener turnos de la semana
export const useWeekTurnos = routeLoader$(async (requestEvent) => {
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

    const weekDates = getWeekDates(targetDate);

    // Obtener turnos del rango de fechas de la semana
    const fromDate = weekDates[0].formatISO();
    const toDate = weekDates[weekDates.length - 1].formatISO();

    const turnosResult = await turnosService.getTurnosByRange(fromDate, toDate);

    // Crear un mapa para acceso rápido a los turnos por fecha
    const turnosMap = new Map();
    turnosResult?.items.forEach(turno => {
      turnosMap.set(turno.fecha, turno);
    });

    // Mapear las fechas con sus turnos correspondientes
    const turnos = weekDates.map(date => {
      const turno = turnosMap.get(date.formatISO());
      return {
        fecha: date.formatISO(),
        turno: turno || null,
      };
    });

    return {
      weekDates: weekDates.map(date => ({
        year: date.year,
        month: date.month,
        day: date.day,
        formatISO: date.formatISO(),
        formatForDisplay: date.formatForDisplay(),
        formatShort: date.formatShort(),
      })),
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
    console.error('Error cargando turnos de la semana:', error);
    const fallbackDate = getLocalizedDate();
    return {
      weekDates: [],
      turnos: [],
      currentDate: {
        year: fallbackDate.year,
        month: fallbackDate.month,
        day: fallbackDate.day,
        formatISO: fallbackDate.formatISO(),
        formatForDisplay: fallbackDate.formatForDisplay(),
        formatShort: fallbackDate.formatShort(),
      },
      error: 'Error al cargar los turnos de la semana',
    };
  }
});

export default component$(() => {
  const weekData = useWeekTurnos();
  const navigate = useNavigate();

  const navigateToWeek = $((dateISO: string) => {
    navigate(`/semana?fecha=${dateISO}`);
  });

  const navigateToPreviousWeek = $(() => {
    const currentDate = LocalizedDate.fromISO(weekData.value.currentDate.formatISO);
    const previousWeek = currentDate.subtractDays(7);
    navigateToWeek(previousWeek.formatISO());
  });

  const navigateToNextWeek = $(() => {
    const currentDate = LocalizedDate.fromISO(weekData.value.currentDate.formatISO);
    const nextWeek = currentDate.addDays(7);
    navigateToWeek(nextWeek.formatISO());
  });

  const navigateToCurrentWeek = $(() => {
    navigate('/semana');
  });

  return (
    <MainLayout>
      <div class="max-w-7xl mx-auto pb-32 md:pb-0">

        {/* Desktop Navigation */}
        <DateNavigation
          currentDate={new Date(weekData.value.currentDate.formatISO + 'T00:00:00')}
          onPrevious$={navigateToPreviousWeek}
          onNext$={navigateToNextWeek}
          onToday$={navigateToCurrentWeek}
          previousLabel="Semana anterior"
          nextLabel="Semana siguiente"
          className="!hidden md:!flex"
        />

        {weekData.value.error ? (
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
                  <p>{weekData.value.error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 md:gap-4 px-1 md:px-0">
            {weekData.value.weekDates.map((date, index) => {
              const turnoData = weekData.value.turnos.find(t => t.fecha === date.formatISO);
              return (
                <TurnoCard
                  key={date.formatISO}
                  turno={turnoData?.turno || null}
                  fecha={new Date(date.formatISO + 'T00:00:00')}
                  compact={true}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Mobile Navigation - Fixed above main navigation */}
      <div class="md:hidden fixed bottom-16 left-0 right-0 bg-white p-2 z-10">
        <DateNavigation
          currentDate={new Date(weekData.value.currentDate.formatISO + 'T00:00:00')}
          onPrevious$={navigateToPreviousWeek}
          onNext$={navigateToNextWeek}
          onToday$={navigateToCurrentWeek}
          compact={true}
          previousLabel="Anterior"
          nextLabel="Siguiente"
        />
      </div>
    </MainLayout>
  );
});

export const head: DocumentHead = {
  title: "Mi Turno - Vista Semanal",
  meta: [
    {
      name: "description",
      content: "Visualiza todos tus turnos de la semana en una cuadrícula organizada",
    },
  ],
};
