import React from "react";
import { twMerge } from "tailwind-merge";

const Button = React.forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      brand:
        "brand-gradient text-white border-none glow-primary hover:opacity-90 active:scale-95 transition-all shadow-lg",
      ghost: "hover:bg-accent/50 hover:text-accent-foreground",
      outline:
        "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground shadow-sm",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-[10px] font-bold tracking-tight uppercase",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
