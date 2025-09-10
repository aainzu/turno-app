import { component$, type QwikIntrinsicElements, Slot } from '@builder.io/qwik';

export type CardProps = QwikIntrinsicElements['div'] & {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
};

export const Card = component$<CardProps>(({
  padding = 'md',
  shadow = 'sm',
  class: className,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const classes = [
    baseClasses,
    shadowClasses[shadow],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div class={classes} {...props}>
      <Slot />
    </div>
  );
});

export type CardHeaderProps = QwikIntrinsicElements['div'];
export type CardContentProps = QwikIntrinsicElements['div'];
export type CardFooterProps = QwikIntrinsicElements['div'];

export const CardHeader = component$<CardHeaderProps>(({
  class: className,
  ...props
}) => {
  const classes = ['border-b border-gray-200 pb-3 mb-3', className].filter(Boolean).join(' ');

  return (
    <div class={classes} {...props}>
      <Slot />
    </div>
  );
});

export const CardContent = component$<CardContentProps>(({
  class: className,
  ...props
}) => {
  return (
    <div class={className} {...props}>
      <Slot />
    </div>
  );
});

export const CardFooter = component$<CardFooterProps>(({
  class: className,
  ...props
}) => {
  const classes = ['border-t border-gray-200 pt-3 mt-3', className].filter(Boolean).join(' ');

  return (
    <div class={classes} {...props}>
      <Slot />
    </div>
  );
});
