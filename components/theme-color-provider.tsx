"use client";

import { useEffect, useState } from "react";

/**
 * 将 HEX 颜色转换为 oklch 格式
 * 简化版本，实际生产中可能需要更精确的转换
 */
function hexToOklch(hex: string): string {
  // 移除 # 前缀
  const cleanHex = hex.replace("#", "");
  
  // 解析 RGB 值
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  // 简化的亮度计算
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  // 返回简化的 oklch 值（实际应用中需要更精确的转换）
  // 这里我们直接返回 HEX，让 CSS 处理
  return hex;
}

/**
 * 主题颜色提供者
 * 从 API 加载自定义主题颜色并应用到 CSS 变量
 */
export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadThemeColor() {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const settings = await response.json();
          const primaryColor = settings.primaryColor;
          
          if (primaryColor) {
            // 应用主题颜色到 CSS 变量
            applyThemeColor(primaryColor);
          }
        }
      } catch (error) {
        console.error("加载主题颜色失败:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    
    loadThemeColor();
  }, []);

  return <>{children}</>;
}

/**
 * 应用主题颜色到 CSS 变量
 */
export function applyThemeColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith("#")) return;
  
  const root = document.documentElement;
  
  // 解析 HEX 颜色
  const cleanHex = hexColor.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // 计算相对亮度
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // 根据亮度决定前景色
  const foregroundColor = luminance > 0.5 ? "#1a1a2e" : "#ffffff";
  
  // 设置 CSS 变量（使用 HEX 格式，现代浏览器支持）
  root.style.setProperty("--primary", hexColor);
  root.style.setProperty("--primary-foreground", foregroundColor);
  
  // 为暗色模式设置不同的值
  // 暗色模式下主色调可以稍微亮一点
  const lighterR = Math.min(255, r + 40);
  const lighterG = Math.min(255, g + 40);
  const lighterB = Math.min(255, b + 40);
  const lighterHex = `#${lighterR.toString(16).padStart(2, "0")}${lighterG.toString(16).padStart(2, "0")}${lighterB.toString(16).padStart(2, "0")}`;
  
  // 存储到 localStorage 以便持久化
  localStorage.setItem("theme-primary-color", hexColor);
}

/**
 * 从 localStorage 恢复主题颜色
 */
export function restoreThemeColor() {
  if (typeof window === "undefined") return;
  
  const savedColor = localStorage.getItem("theme-primary-color");
  if (savedColor) {
    applyThemeColor(savedColor);
  }
}
