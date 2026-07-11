import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
          // Variants
          variant === 'default' && "bg-amber-500 text-white shadow hover:bg-amber-600 active:scale-95 transition-transform",
          variant === 'destructive' && "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95 transition-transform",
          variant === 'outline' && "border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900",
          variant === 'secondary' && "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200/80",
          variant === 'ghost' && "hover:bg-slate-50 hover:text-slate-950",
          variant === 'link' && "text-slate-900 underline-offset-4 hover:underline",
          // Sizes
          size === 'default' && "h-9 px-4 py-2",
          size === 'sm' && "h-8 rounded-md px-3 text-xs",
          size === 'lg' && "h-10 rounded-md px-8",
          size === 'icon' && "size-9",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
