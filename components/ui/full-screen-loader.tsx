type FullScreenLoaderProps = {
  label?: string;
};

export function FullScreenLoader({ label = "Loading BloomCycle..." }: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="bc-card mx-4 w-full max-w-sm space-y-4 p-6 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary-100)] border-t-[var(--color-primary-500)]" />
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">{label}</p>
        <p className="text-xs bc-muted">Please wait a moment.</p>
      </div>
    </div>
  );
}
