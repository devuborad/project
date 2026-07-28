import * as React from "react"
import { cn } from "../../utils/cn"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  glowEffect?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverEffect = true, glowEffect = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card w-full h-full relative group transition-all duration-300 rounded-[20px]",
          !hoverEffect && "!shadow-none !bg-none"
        )}
        style={{
          borderRadius: "20px",
          ...props.style
        }}
        {...props}
      >
        <div
          className={cn(
            "card2 w-full h-full rounded-[20px] overflow-hidden transition-all duration-200 relative z-10",
            "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white",
            "border border-gray-200/80 dark:border-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/80 focus-visible:ring-offset-2",
            className
          )}
          style={{
            borderRadius: "20px"
          }}
        >
          {/* Subtle inner top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/30 dark:via-white/25 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Ambient subtle corner glow on hover */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative z-10 w-full h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }

