type FullScreenLoaderProps = {
  label?: string;
};

export function FullScreenLoader({ label = "Loading BloomCycle..." }: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="bc-card mx-4 w-full max-w-sm space-y-4 p-6 text-center">
        <div className="relative mx-auto h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--color-primary-100)] border-t-[var(--color-primary-500)]" />
          <div className="absolute inset-[14px] animate-pulse rounded-full bg-[var(--color-primary-100)]" />
        </div>
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">{label}</p>
        <div className="flex items-center justify-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary-500)] [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary-500)] [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary-500)] [animation-delay:240ms]" />
        </div>
        <p className="text-xs bc-muted">Please wait a moment.</p>
      </div>
    </div>
  );
}
