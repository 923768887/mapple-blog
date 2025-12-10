"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// 导航链接配置
const navLinks = [
  { href: "/", label: "首页" },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/about", label: "关于" },
  { href: "/links", label: "友链" },
  { href: "/admin", label: "后台" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        {/* Logo 区域 */}
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-8 rounded-full bg-primary/15" />
          <Link href="/" className="text-lg">
            My Blog
          </Link>
        </div>

        {/* 桌面端导航 - 在 md 及以上屏幕显示 */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href && "bg-accent text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右侧操作区域 */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* 桌面端登录按钮 - 在 md 及以上屏幕显示 */}
          <Link href="/login" className="hidden md:block">
            <Button variant="outline" size="sm">
              登录
            </Button>
          </Link>

          {/* 移动端汉堡菜单 - 在 md 以下屏幕显示 */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="打开菜单">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">导航菜单</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === link.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 border-t pt-6">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    登录
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
