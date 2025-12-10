"use client";

import { useEffect } from "react";

/**
 * 将 HEX 颜色转换为 RGB 值
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 将 RGB 转换为 OKLCH（简化版本）
 * 实际生产中可能需要更精确的颜色空间转换
 */
function rgbToOklch(r: number, g: number, b: number): string {
  // 归一化 RGB 值
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // 计算相对亮度
  const luminance = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
  
  // 简化的 oklch 计算
  // L: 亮度 (0-1)
  // C: 色度 (0-0.4)
  // H: 色相 (0-360)
  
  const l = Math.cbrt(luminance);
  
  // 计算色度和色相
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  
  const c = delta * 0.4;
  
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`;
}

/**
 * 应用主题颜色到 CSS 变量
 */
export function applyThemeColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith("#")) return;
  
  const rgb = hexToRgb(hexColor);
  if (!rgb) return;
  
  const root = document.documentElement;
  
  // 计算 oklch 值
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
  
  // 计算相对亮度来决定前景色
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const foregroundOklch = luminance > 0.5 
    ? "oklch(0.21 0.006 285.885)" 
    : "oklch(0.985 0 0)";
  
  // 设置亮色模式的主色调
  root.style.setProperty("--primary", oklch);
  root.style.setProperty("--primary-foreground", foregroundOklch);
  
  // 设置侧边栏主色调
  root.style.setProperty("--sidebar-primary", oklch);
  root.style.setProperty("--sidebar-primary-foreground", foregroundOklch);
  
  // 存储到 localStorage
  localStorage.setItem("theme-primary-color", hexColor);
}

/**
 * 主题颜色初始化组件
 * 在应用启动时加载并应用保存的主题颜色
 */
export function ThemeColorInitializer() {
  useEffect(() => {
    // 首先尝试从 localStorage 恢复（快速）
    const savedColor = localStorage.getItem("theme-primary-color");
    if (savedColor) {
      applyThemeColor(savedColor);
    }
    
    // 然后从 API 加载最新设置
    async function loadThemeFromApi() {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const settings = await response.json();
          if (settings.primaryColor) {
            applyThemeColor(settings.primaryColor);
          }
        }
      } catch (error) {
        console.error("加载主题颜色失败:", error);
      }
    }
    
    loadThemeFromApi();
  }, []);

  return null;
}
