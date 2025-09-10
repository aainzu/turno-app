import { component$, JSXChildren, Slot } from '@builder.io/qwik';

export type ChipProps = {
  variant?: 'manana' | 'tarde' | 'noche' | 'libre' | 'default';
  size?: 'sm' | 'md';
};

export const Chip = component$<ChipProps>(({
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  const variantClasses = {
    manana: 'bg-emerald-100 text-emerald-800',
    tarde: 'bg-amber-100 text-amber-800',
    noche: 'bg-blue-100 text-blue-800',
    libre: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  const classes = [baseClasses, variantClasses[variant], sizeClasses[size]].join(' ');

  return (
    <span class={classes}>
      <Slot />
    </span>
  );
});
