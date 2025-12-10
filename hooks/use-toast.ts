"use client";

import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

/**
 * Toast hook - 使用 sonner 实现
 */
export function useToast() {
  const toast = ({ title, description, variant, duration = 3000 }: ToastOptions) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
        duration,
      });
    } else {
      sonnerToast.success(title, {
        description,
        duration,
      });
    }
  };

  return { toast };
}

export { sonnerToast as toast };
