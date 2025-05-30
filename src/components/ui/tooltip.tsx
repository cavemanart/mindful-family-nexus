
import * as React from "react"

// Simple CSS-only tooltip implementation to replace Radix UI tooltips
// This prevents the dispatcher errors while maintaining tooltip functionality

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </div>
))
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sideOffset?: number
  }
>(({ className, children, sideOffset = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={`absolute z-50 bg-black text-white px-2 py-1 rounded text-xs pointer-events-none ${className || ''}`}
    style={{ 
      top: `calc(100% + ${sideOffset}px)`,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: 0
    }}
    {...props}
  >
    {children}
  </div>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
