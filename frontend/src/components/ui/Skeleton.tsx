import { component$ } from '@builder.io/qwik';

export type SkeletonProps = {
  width?: string;
  height?: string;
  class?: string;
  rounded?: boolean;
};

export const Skeleton = component$<SkeletonProps>(({
  width = 'w-full',
  height = 'h-4',
  class: className,
  rounded = true
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const roundedClass = rounded ? 'rounded' : '';
  const classes = [baseClasses, width, height, roundedClass, className].filter(Boolean).join(' ');

  return <div class={classes} />;
});

export const SkeletonCard = component$(() => {
  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      <div class="space-y-3">
        <Skeleton width="w-3/4" height="h-6" />
        <Skeleton width="w-1/2" height="h-4" />
        <div class="flex space-x-2">
          <Skeleton width="w-16" height="h-6" rounded={false} class="rounded-full" />
          <Skeleton width="w-20" height="h-6" rounded={false} class="rounded-full" />
        </div>
      </div>
    </div>
  );
});

export const SkeletonList = component$(({ count = 3 }: { count?: number }) => {
  return (
    <div class="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
});
