"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 延迟到下一帧再标记挂载，避免同步 setState 触发警告
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 避免 SSR/CSR 主题不一致导致 hydration 警告
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 opacity-0">
        <Button variant="ghost" size="icon" aria-label="浅色模式" />
        <Button variant="ghost" size="icon" aria-label="深色模式" />
        <Button variant="ghost" size="icon" aria-label="跟随系统" />
      </div>
    );
  }

  const current = theme === "system" ? systemTheme : theme;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="浅色模式"
        onClick={() => setTheme("light")}
        data-state={current === "light" ? "active" : "inactive"}
        className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
      >
        <Sun className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="深色模式"
        onClick={() => setTheme("dark")}
        data-state={current === "dark" ? "active" : "inactive"}
        className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
      >
        <Moon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="跟随系统"
        onClick={() => setTheme("system")}
        data-state={theme === "system" ? "active" : "inactive"}
        className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
      >
        <Sun className="size-4" />
        <Moon className="size-4 -ml-1" />
      </Button>
    </div>
  );
}

