import { BadgePercent } from "lucide-react";
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta-300/60 bg-terracotta-100/70 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-terracotta-700">
      <BadgePercent className="size-3.5" strokeWidth={2} />
      {children}
    </span>
  );
}
