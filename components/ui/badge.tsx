import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium font-mono uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-canvas-sunken text-ink-soft",
        read: "bg-green-soft text-green",
        prepare: "bg-signal-soft text-signal",
        commit: "bg-amber-soft text-amber",
        error: "bg-red-soft text-red",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
