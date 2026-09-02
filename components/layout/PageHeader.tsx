import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 md:px-8 md:py-6">
      <div>
        <h1 className="text-[20px] font-medium tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-[60ch] text-[13.5px] text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
