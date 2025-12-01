import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-slate-900 text-white border-transparent dark:bg-slate-50 dark:text-slate-900",

  secondary:
    "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700",

  success:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",

  warning:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",

  destructive:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100",

  outline:
    "bg-transparent text-slate-900 border-slate-300 dark:text-slate-100 dark:border-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
