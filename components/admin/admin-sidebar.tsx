"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderOpen,
  Settings,
  Home,
  LogOut,
  ChevronRight,
  PenSquare,
  Users,
  Shield,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";

// 后台导航配置
const navItems = [
  {
    title: "仪表盘",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "内容管理",
    icon: FileText,
    isActive: true,
    items: [
      { title: "所有文章", url: "/admin/posts" },
      { title: "新建文章", url: "/admin/posts/new" },
    ],
  },
  {
    title: "标签管理",
    url: "/admin/tags",
    icon: Tags,
  },
  {
    title: "分类管理",
    url: "/admin/categories",
    icon: FolderOpen,
  },
  {
    title: "用户管理",
    url: "/admin/users",
    icon: Users,
    adminOnly: true, // 仅管理员可见
  },
  {
    title: "站点设置",
    url: "/admin/settings",
    icon: Settings,
    adminOnly: true, // 仅管理员可见
  },
];


// 用户导航组件
function NavUser() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    // 获取当前用户信息
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  const userName = user?.name || "用户";
  const userEmail = user?.email || "";
  const userInitials = userName.slice(0, 2).toUpperCase();

  // 登出处理
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="size-4" />
                返回前台
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// 主导航组件
function NavMain({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  // 根据权限过滤菜单项
  const filteredNavItems = navItems.filter((item) => {
    // 站点设置和用户管理仅管理员可见
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
      <SidebarMenu>
        {filteredNavItems.map((item) => {
          // 有子菜单的项目
          if (item.items) {
            const isActive = item.items.some((subItem) => pathname === subItem.url);
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive || item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // 普通菜单项
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                <Link href={item.url!}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}


// 快捷操作组件
function QuickActions() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>快捷操作</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="新建文章">
            <Link href="/admin/posts/new">
              <PenSquare />
              <span>新建文章</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

// 后台侧边栏主组件
export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 获取当前用户角色
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role === "ADMIN") {
          setIsAdmin(true);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {isAdmin ? <Shield className="size-4" /> : <LayoutDashboard className="size-4" />}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">博客后台</span>
                  <span className="truncate text-xs">{isAdmin ? "超级管理员" : "内容管理"}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain isAdmin={isAdmin} />
        <QuickActions />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
