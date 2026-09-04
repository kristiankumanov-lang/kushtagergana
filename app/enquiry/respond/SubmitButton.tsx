"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  label,
  variant,
}: {
  label: string;
  variant: "confirm" | "decline";
}) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === "confirm"
      ? "bg-accent-500 text-cream hover:bg-accent-600"
      : "border border-terracotta-500 text-terracotta-700 hover:bg-terracotta-100";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${variantClass}`}
    >
      {label}{pending ? "…" : ""}
    </button>
  );
}
