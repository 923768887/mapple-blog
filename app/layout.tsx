import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header, Footer } from "@/components/layout";
import { generateRootMetadata } from "@/lib/metadata";
import { Toaster } from "@/components/ui/sonner";
import { ThemeColorInitializer } from "@/components/theme-color-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 根布局元数据配置
 * 包含 title、description、keywords 等基础 meta 标签
 * Requirements: 9.1
 */
export const metadata: Metadata = generateRootMetadata();

// 内联脚本：在页面渲染前应用主题颜色，避免闪烁
const themeColorScript = `
(function() {
  try {
    var color = localStorage.getItem('theme-primary-color');
    if (color && color.match(/^#[0-9A-Fa-f]{6}$/)) {
      var r = parseInt(color.slice(1, 3), 16);
      var g = parseInt(color.slice(3, 5), 16);
      var b = parseInt(color.slice(5, 7), 16);
      var rNorm = r / 255;
      var gNorm = g / 255;
      var bNorm = b / 255;
      var luminance = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
      var l = Math.cbrt(luminance);
      var max = Math.max(rNorm, gNorm, bNorm);
      var min = Math.min(rNorm, gNorm, bNorm);
      var delta = max - min;
      var h = 0;
      if (delta !== 0) {
        if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
        else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
        else h = (rNorm - gNorm) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
      }
      var c = delta * 0.4;
      var oklch = 'oklch(' + l.toFixed(3) + ' ' + c.toFixed(3) + ' ' + h + ')';
      var fg = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 
        ? 'oklch(0.21 0.006 285.885)' 
        : 'oklch(0.985 0 0)';
      document.documentElement.style.setProperty('--primary', oklch);
      document.documentElement.style.setProperty('--primary-foreground', fg);
      document.documentElement.style.setProperty('--sidebar-primary', oklch);
      document.documentElement.style.setProperty('--sidebar-primary-foreground', fg);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeColorScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ThemeColorInitializer />
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
