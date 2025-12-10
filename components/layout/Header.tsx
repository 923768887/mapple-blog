"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, Home, Info, Link2, Settings, LogIn, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// 导航链接配置
const navLinks = [
  { href: "/", label: "首页", icon: Home },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/about", label: "关于", icon: Info },
  { href: "/links", label: "友链", icon: Link2 },
  { href: "/admin", label: "后台", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        {/* Logo 区域 */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            M
          </div>
          <span className="text-lg tracking-tight">My Blog</span>
        </Link>

        {/* 桌面端导航 - 在 md 及以上屏幕显示 */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === link.href 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右侧操作区域 */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* 桌面端登录按钮 - 在 md 及以上屏幕显示 */}
          <Link href="/login" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-1.5">
              <LogIn className="h-4 w-4" />
              登录
            </Button>
          </Link>

          {/* 移动端汉堡菜单 - 在 md 以下屏幕显示 */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="打开菜单"
                className="relative"
              >
                <Menu className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isOpen && "rotate-90 opacity-0"
                )} />
                <X className={cn(
                  "absolute h-5 w-5 transition-all duration-200",
                  isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                )} />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] p-0 flex flex-col"
            >
              {/* 菜单头部 */}
              <SheetHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                      M
                    </div>
                    <span>导航菜单</span>
                  </SheetTitle>
                </div>
              </SheetHeader>
              
              {/* 导航链接 */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-all",
                          "active:scale-[0.98]",
                          isActive 
                            ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <link.icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                        <span>{link.label}</span>
                        {isActive && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/50" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              {/* 底部操作区 */}
              <div className="border-t p-4 space-y-3">
                {/* 主题切换 */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">主题模式</span>
                  <ThemeToggle />
                </div>
                
                {/* 登录按钮 */}
                <SheetClose asChild>
                  <Link href="/login" className="block">
                    <Button className="w-full gap-2" size="lg">
                      <LogIn className="h-4 w-4" />
                      登录 / 注册
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
