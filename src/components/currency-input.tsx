import * as React from "react"

import { cn } from "@/lib/utils"
import Input, { type CurrencyInputProps } from "react-currency-input-field"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
type CombinedProps = InputProps & CurrencyInputProps;

const CurrencyInput = React.forwardRef<HTMLInputElement, CombinedProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        decimalsLimit={2}
        prefix="Rp "
        decimalSeparator=","
        groupSeparator="."
        onValueChange={(value, name, values) => console.log(value, name, values)}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
