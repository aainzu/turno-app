import { component$ } from '@builder.io/qwik';
import { Button } from '../ui/Button';
import { formatDateForDisplay } from '../../lib/utils/date';

export type DateNavigationProps = {
  currentDate: Date | any; // Puede ser Date o LocalizedDate
  onPrevious$: () => void;
  onNext$: () => void;
  onToday$: () => void;
  previousLabel?: string;
  nextLabel?: string;
  showTodayButton?: boolean;
  compact?: boolean;
  className?: string;
};

export const DateNavigation = component$<DateNavigationProps>(({
  currentDate,
  onPrevious$,
  onNext$,
  onToday$,
  previousLabel = 'Anterior',
  nextLabel = 'Siguiente',
  showTodayButton = true,
  compact = false,
  className = ''
}) => {
  const formattedDate = formatDateForDisplay(currentDate);

  if (compact) {
    return (
      <div class={`flex items-center justify-between ${className}`}>
        <Button
          variant="outline"
          size="md"
          onClick$={onPrevious$}
          aria-label={previousLabel}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <div class="text-center">
          <h2 class="text-lg font-semibold text-gray-900">{formattedDate}</h2>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick$={onNext$}
          aria-label={nextLabel}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <div class={`flex items-center justify-between mb-6 ${className}`}>
      <Button
        variant="outline"
        onClick$={onPrevious$}
        class="flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{previousLabel}</span>
      </Button>

      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">{formattedDate}</h1>
        {showTodayButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick$={onToday$}
            class="mt-2 text-blue-600 hover:text-blue-700"
          >
            Ir a hoy
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        onClick$={onNext$}
        class="flex items-center space-x-2"
      >
        <span>{nextLabel}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
});
