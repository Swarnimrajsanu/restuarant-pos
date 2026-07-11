import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType | undefined>(undefined);

export interface SheetProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Sheet({ children, open, onOpenChange }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(SheetContext);
    if (!context) throw new Error("SheetTrigger must be used within Sheet");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.onOpenChange(true);
      if (onClick) onClick(e);
    };

    return (
      <button
        type="button"
        ref={ref}
        onClick={handleClick}
        className={cn(className)}
        {...props}
      />
    );
  }
);
SheetTrigger.displayName = "SheetTrigger";

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = "left", children, ...props }, ref) => {
    const context = React.useContext(SheetContext);
    if (!context) throw new Error("SheetContent must be used within Sheet");

    if (!context.open) return null;

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => context.onOpenChange(false)}
        />
        {/* Panel */}
        <div
          ref={ref}
          className={cn(
            "fixed bg-white shadow-xl transition-all duration-300 ease-in-out h-full w-72",
            side === "left" && "left-0 top-0 bottom-0 animate-in slide-in-from-left-full duration-200",
            side === "right" && "right-0 top-0 bottom-0 animate-in slide-in-from-right-full duration-200",
            className
          )}
          {...props}
        >
          {children}
          {/* Close button inside content */}
          <button
            onClick={() => context.onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
          >
            <svg
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
  )
)
SheetDescription.displayName = "SheetDescription"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
