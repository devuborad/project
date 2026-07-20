import * as React from "react"
import { cn } from "../../utils/cn"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  glowEffect?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverEffect = true, glowEffect = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/[0.03] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden relative group",
          hoverEffect && "transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.06] hover:border-white/20",
          glowEffect && "hover:shadow-[0_0_40px_rgba(255,31,77,0.15)]",
          className
        )}
        {...props}
      >
        {/* Subtle inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 h-full">
          {props.children}
        </div>
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
