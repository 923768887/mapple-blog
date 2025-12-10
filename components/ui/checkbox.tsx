"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// Checkbox 组件属性
export interface CheckboxProps extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  indeterminate?: boolean
}

// Checkbox 组件
function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  indeterminate = false,
  disabled,
  ...props
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-[4px] border border-primary shadow-sm",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        indeterminate && "bg-primary text-primary-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {(checked || indeterminate) && (
        <span className="flex items-center justify-center text-current">
          {indeterminate ? (
            <span className="h-[2px] w-2 bg-current" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </span>
      )}
    </button>
  )
}

export { Checkbox }
