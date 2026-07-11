import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500",
        variant === 'default' && "border-transparent bg-amber-500 text-white shadow",
        variant === 'secondary' && "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        variant === 'destructive' && "border-transparent bg-red-500 text-white shadow",
        variant === 'outline' && "text-slate-900 border-slate-200",
        variant === 'success' && "border-transparent bg-emerald-100 text-emerald-800 border-emerald-200",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
