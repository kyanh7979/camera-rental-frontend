import { cn } from '../../utils/classNames.js';

function SkeletonLoader({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-800/60',
        className
      )}
    />
  );
}

export default SkeletonLoader;

