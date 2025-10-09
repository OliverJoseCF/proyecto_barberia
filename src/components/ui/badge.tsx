import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantClasses = {
    default: "border-transparent bg-gold text-background hover:bg-gold/80",
    secondary: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-500/80",
    outline: "text-foreground border-border",
  }
  
  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props} 
    />
  )
}

export { Badge }