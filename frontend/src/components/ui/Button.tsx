import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-white hover:bg-brand-secondary shadow-[0_0_20px_rgba(255,31,77,0.35)] hover:shadow-[0_0_35px_rgba(255,31,77,0.65)] hover:-translate-y-0.5",
        gradient: "bg-brand-gradient text-white hover:opacity-95 shadow-[0_0_25px_rgba(255,0,60,0.4)] hover:shadow-[0_0_40px_rgba(255,0,60,0.7)] hover:-translate-y-0.5",
        ai: "bg-ai-gradient text-white hover:opacity-95 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] hover:-translate-y-0.5",
        outline: "border border-gray-300 dark:border-white/20 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 hover:border-brand-primary/50 dark:hover:border-white/40 text-gray-800 dark:text-white",
        ghost: "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white",
        glass: "glass-card text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-white/15 border border-gray-300/80 dark:border-white/15",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Subtle top edge shine */}
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative z-10 flex items-center justify-center gap-2">{props.children}</span>
        {/* Ripple/Glow effect overlay */}
        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-full" />
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

