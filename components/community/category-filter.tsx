"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type CategoryFilterProps = {
  categories: string[];
  value: string;
};

export function CategoryFilter({ categories, value }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue) {
      params.set("category", nextValue);
    } else {
      params.delete("category");
    }

    params.delete("editId");

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <label className="bc-label text-xs min-w-[180px]">
      <span className="inline-flex items-center gap-2">
        Category
        {isPending ? (
          <span className="inline-flex items-center gap-1 text-[var(--color-primary-700)]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
            Loading...
          </span>
        ) : null}
      </span>
      <select
        name="category"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="bc-input"
        disabled={isPending}
      >
        <option value="">All</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
