import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-2xl text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid:
          "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400",
        outline:
          "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:outline-slate-500",
        subtle:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-600",
        ghost:
          "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-300 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:outline-slate-600",
        destructive:
          "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:outline-red-600",
        link:
          "text-indigo-600 underline underline-offset-4 hover:text-indigo-500 focus-visible:outline-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200",
      },
      size: {
        default: "px-5",
        sm: "min-h-10 px-4 text-sm",
        lg: "min-h-14 px-6 text-lg",
        icon: "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "solid",
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
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
