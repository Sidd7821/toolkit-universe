import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconVariants = cva(
  "flex items-center justify-center transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        gradient: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20",
        success: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
        error: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
      },
      size: {
        sm: "w-6 h-6 text-xs",
        default: "w-8 h-8 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
      },
      shape: {
        default: "rounded-md",
        rounded: "rounded-lg",
        full: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
);

export interface IconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconVariants> {
  children: React.ReactNode;
  asChild?: boolean;
}

const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ className, variant, size, shape, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";
    return (
      <Comp
        className={cn(iconVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Icon.displayName = "Icon";

export { Icon, iconVariants };
