"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// 底部链接配置
const footerLinks = [
  { href: "/about", label: "关于" },
  { href: "/links", label: "友链" },
  { href: "/tags", label: "标签" },
];

interface SiteSettings {
  siteName: string;
  footerText: string;
  footerIcp: string;
  socialGithub: string;
  socialTwitter: string;
  socialEmail: string;
  siteAuthor: string;
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // 从 API 获取站点设置
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          siteName: data.siteName || "My Blog",
          footerText: data.footerText || "",
          footerIcp: data.footerIcp || "",
          socialGithub: data.socialGithub || "",
          socialTwitter: data.socialTwitter || "",
          socialEmail: data.socialEmail || "",
          siteAuthor: data.siteAuthor || "",
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // 默认值
  const displaySettings = settings || {
    siteName: "My Blog",
    footerText: "",
    footerIcp: "",
    socialGithub: "",
    socialTwitter: "",
    socialEmail: "",
    siteAuthor: "",
  };

  // 构建版权信息
  const copyrightText = displaySettings.footerText || 
    `© ${currentYear} ${displaySettings.siteName}. All rights reserved.`;

  // 检查是否有社交链接
  const hasSocialLinks = displaySettings.socialGithub || displaySettings.socialTwitter || displaySettings.socialEmail;

  return (
    <footer className="border-t bg-background/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* 主要内容区 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 版权信息 */}
          <div className="text-center sm:text-left">
            {isLoading ? (
              <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {copyrightText}
                </p>
                {displaySettings.siteAuthor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    By {displaySettings.siteAuthor}
                  </p>
                )}
              </>
            )}
          </div>

          {/* 底部导航链接 - 在平板及以上屏幕显示 */}
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 社交链接 */}
          {!isLoading && hasSocialLinks && (
            <div className="flex items-center justify-center gap-3 sm:justify-end">
              {displaySettings.socialGithub && (
                <Link
                  href={displaySettings.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="GitHub"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Link>
              )}
              {displaySettings.socialTwitter && (
                <Link
                  href={displaySettings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="微信"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
              )}
              {displaySettings.socialEmail && (
                <Link
                  href={`mailto:${displaySettings.socialEmail}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="邮箱"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ICP 备案信息 */}
        {!isLoading && displaySettings.footerIcp && (
          <div className="mt-4 pt-4 border-t text-center">
            <Link
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {displaySettings.footerIcp}
            </Link>
          </div>
        )}

        {/* 移动端底部导航 - 仅在移动端显示 */}
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t pt-4 text-sm text-muted-foreground sm:hidden">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 技术栈信息 */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Built with Next.js · Tailwind · Shadcn UI
          </p>
        </div>
      </div>
    </footer>
  );
}
