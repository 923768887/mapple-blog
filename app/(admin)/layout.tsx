"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

// 生成面包屑路径
function getBreadcrumbs(pathname: string): { href: string; label: string; isLast: boolean }[] {
  const items: { href: string; label: string }[] = [];
  
  // 根据路径直接构建面包屑
  if (pathname === "/admin") {
    return [{ href: "/admin", label: "仪表盘", isLast: true }];
  }
  
  // 添加仪表盘作为根
  items.push({ href: "/admin", label: "仪表盘" });
  
  // 根据当前路径添加对应的面包屑
  if (pathname.startsWith("/admin/posts")) {
    items.push({ href: "/admin/posts", label: "文章管理" });
    if (pathname === "/admin/posts/new") {
      items.push({ href: "/admin/posts/new", label: "新建文章" });
    } else if (pathname.includes("/edit")) {
      items.push({ href: pathname, label: "编辑文章" });
    }
  } else if (pathname === "/admin/tags") {
    items.push({ href: "/admin/tags", label: "标签管理" });
  } else if (pathname === "/admin/categories") {
    items.push({ href: "/admin/categories", label: "分类管理" });
  } else if (pathname === "/admin/settings") {
    items.push({ href: "/admin/settings", label: "站点设置" });
  }

  return items.map((item, index) => ({
    href: item.href,
    label: item.label,
    isLast: index === items.length - 1,
  }));
}


// 后台布局组件
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <SessionProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <div key={item.href} className="flex items-center gap-2">
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                        {item.isLast ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 px-4">
              <ThemeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
