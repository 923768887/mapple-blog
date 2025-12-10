import Link from "next/link";

// 底部链接配置
const footerLinks = [
  { href: "/about", label: "关于" },
  { href: "/links", label: "友链" },
  { href: "/tags", label: "标签" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* 移动端布局：垂直堆叠 */}
        {/* 平板/桌面端布局：水平排列 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 版权信息 */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} My Blog. All rights reserved.
            </p>
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

          {/* 技术栈信息 */}
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground">
              Built with Next.js · Tailwind · Shadcn UI
            </p>
          </div>
        </div>

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
      </div>
    </footer>
  );
}
