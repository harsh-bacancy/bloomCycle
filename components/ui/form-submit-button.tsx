"use client";

import { useFormStatus } from "react-dom";

import { FullScreenLoader } from "@/components/ui/full-screen-loader";

type FormSubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  showFullScreenLoader?: boolean;
};

export function FormSubmitButton({
  children,
  pendingText = "Please wait...",
  className,
  showFullScreenLoader = false,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      {showFullScreenLoader && pending ? <FullScreenLoader label={pendingText} /> : null}
      <button type="submit" disabled={pending} className={className}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
            {pendingText}
          </span>
        ) : (
          children
        )}
      </button>
    </>
  );
}
