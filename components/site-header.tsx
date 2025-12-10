"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "首页" },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/about", label: "关于" },
  { href: "/links", label: "友链" },
  { href: "/admin", label: "后台" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-8 rounded-full bg-primary/15" />
          <Link href="/" className="text-lg">
            My Blog
          </Link>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm">
              登录
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

