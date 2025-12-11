"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Search, Home, Info, Link2, Settings, LogIn, X, User, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从 API 获取站点设置和用户信息
  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((res) => res.json()),
      fetch("/api/auth/me").then((res) => res.json()),
    ])
      .then(([settingsData, userData]) => {
        if (settingsData.siteName) {
          setSiteName(settingsData.siteName);
        }
        if (userData.user) {
          setUser(userData.user);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // 登出处理
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  // 获取站点名称首字母（加载完成后显示）
  const displayName = siteName || "My Blog";
  const siteInitial = displayName.charAt(0).toUpperCase();

  // 获取用户名首字母
  const userInitials = user?.name 
    ? user.name.slice(0, 2).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        {/* Logo 区域 */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded" />
            ) : (
              siteInitial
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <span className="text-lg tracking-tight">{displayName}</span>
          )}
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
          
          {/* 桌面端用户区域 - 在 md 及以上屏幕显示 */}
          <div className="hidden md:block">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded-md" />
            ) : user ? (
              // 已登录：显示用户头像和下拉菜单
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name || "用户"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      管理后台
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 未登录：显示登录按钮
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  登录
                </Button>
              </Link>
            )}
          </div>

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
                      {siteInitial}
                    </div>
                    <span>{displayName}</span>
                  </SheetTitle>
                </div>
              </SheetHeader>

              {/* 用户信息（如果已登录） */}
              {user && (
                <div className="border-b px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name || "用户"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
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
                
                {/* 登录/登出按钮 */}
                <SheetClose asChild>
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </Button>
                  ) : (
                    <Link href="/login" className="block">
                      <Button className="w-full gap-2" size="lg">
                        <LogIn className="h-4 w-4" />
                        登录 / 注册
                      </Button>
                    </Link>
                  )}
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
