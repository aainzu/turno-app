import { component$, $ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { MainLayout } from "../components/layout/MainLayout";
import { TurnoCard } from "../components/turnos/TurnoCard";
import { DateNavigation } from "../components/turnos/DateNavigation";
import { SkeletonCard } from "../components/ui/Skeleton";
import { getLocalizedDate, LocalizedDate } from "../lib/utils/date";
import { turnosService } from "../lib/services/turnos.service";
import type { DocumentHead } from "@builder.io/qwik-city";

// Loader para obtener el turno de una fecha específica
export const useTodayTurno = routeLoader$(async (requestEvent) => {
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

    const fechaISO = targetDate.formatISO();

    // Llamada a la API para obtener el turno
    const turno = await turnosService.getTurnoByFecha(fechaISO);

    return {
      turno,
      fecha: fechaISO,
      fechaObj: {
        year: targetDate.year,
        month: targetDate.month,
        day: targetDate.day,
        dayOfWeek: targetDate.dayOfWeek,
        formatISO: fechaISO,
        formatForDisplay: targetDate.formatForDisplay(),
        formatShort: targetDate.formatShort(),
      },
    };
  } catch (error) {
    console.error('Error cargando turno:', error);
    const fallbackDate = getLocalizedDate();
    const fallbackISO = fallbackDate.formatISO();

    return {
      turno: null,
      fecha: fallbackISO,
      fechaObj: {
        year: fallbackDate.year,
        month: fallbackDate.month,
        day: fallbackDate.day,
        dayOfWeek: fallbackDate.dayOfWeek,
        formatISO: fallbackISO,
        formatForDisplay: fallbackDate.formatForDisplay(),
        formatShort: fallbackDate.formatShort(),
      },
      error: 'Error al cargar el turno',
    };
  }
});

export default component$(() => {
  const todayData = useTodayTurno();
  const navigate = useNavigate();

  const navigateToDate = $((dateISO: string) => {
    navigate(`/?fecha=${dateISO}`);
  });

  const navigateToPrevious = $(() => {
    const currentDate = LocalizedDate.fromISO(todayData.value.fechaObj.formatISO);
    const previousDate = currentDate.subtractDays(1);
    navigateToDate(previousDate.formatISO());
  });

  const navigateToNext = $(() => {
    const currentDate = LocalizedDate.fromISO(todayData.value.fechaObj.formatISO);
    const nextDate = currentDate.addDays(1);
    navigateToDate(nextDate.formatISO());
  });

  const navigateToToday = $(() => {
    navigate('/');
  });


  console.log(todayData.value.turno);
  return (
    <MainLayout>
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Mi Turno</h1>
          <p class="text-gray-600">
            Visualiza tu turno de trabajo y navega por diferentes fechas.
          </p>
        </div>

        <DateNavigation
          currentDate={new Date(todayData.value.fechaObj.formatISO + 'T00:00:00')}
          onPrevious$={navigateToPrevious}
          onNext$={navigateToNext}
          onToday$={navigateToToday}
          previousLabel="Día anterior"
          nextLabel="Día siguiente"
          className="!hidden md:!flex"
        />

        <div class="space-y-6">
          {todayData.value.error ? (
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
                    <p>{todayData.value.error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <TurnoCard
              turno={todayData.value.turno || null}
              fecha={new Date(todayData.value.fecha + 'T00:00:00')}
              showDate={false}
            />
          )}
        </div>

        <div class="mt-8 text-center hidden md:block">
          <p class="text-sm text-gray-500">
            ¿Quieres ver más? Navega a la vista semanal o mensual usando las pestañas superiores.
          </p>
        </div>
      </div>

      <div class="md:hidden fixed bottom-16 left-0 right-0 bg-white p-2 z-10">
        <DateNavigation
          currentDate={new Date(todayData.value.fechaObj.formatISO + 'T00:00:00')}
          onPrevious$={navigateToPrevious}
          onNext$={navigateToNext}
          onToday$={navigateToToday}
          compact={true}
        />
      </div>
    </MainLayout>
  );
});

export const head: DocumentHead = {
  title: "Mi Turno - Hoy",
  meta: [
    {
      name: "description",
      content: "Visualiza tu turno de trabajo para hoy y navega por fechas",
    },
  ],
};
