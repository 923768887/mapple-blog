"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

// 后台侧边栏导航配置
const sidebarLinks = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章管理", icon: FileText },
  { href: "/admin/tags", label: "标签管理", icon: Tags },
  { href: "/admin/categories", label: "分类管理", icon: FolderOpen },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
];

// 侧边栏导航组件
function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}


// 后台布局组件
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 桌面端侧边栏 - 在 lg 及以上屏幕显示 */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-background lg:block">
        <div className="flex h-full flex-col">
          {/* 侧边栏头部 */}
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <div className="size-8 rounded-full bg-primary/15" />
              <span>后台管理</span>
            </Link>
          </div>

          {/* 侧边栏导航 */}
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav />
          </div>

          {/* 侧边栏底部 */}
          <div className="border-t p-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Home className="h-4 w-4" />
                返回前台
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col">
        {/* 移动端顶部导航栏 */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/70 px-4 backdrop-blur lg:hidden">
          {/* 移动端汉堡菜单 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="打开菜单">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="size-8 rounded-full bg-primary/15" />
                  后台管理
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-[calc(100%-60px)] flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  <SidebarNav />
                </div>
                <div className="border-t p-4">
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Home className="h-4 w-4" />
                      返回前台
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* 移动端标题 */}
          <span className="font-semibold">后台管理</span>

          {/* 主题切换 */}
          <ThemeToggle />
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
