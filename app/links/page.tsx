const links = [
  { name: "Next.js", url: "https://nextjs.org", desc: "React 全栈框架" },
  { name: "Shadcn UI", url: "https://ui.shadcn.com", desc: "可复制的组件库" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com", desc: "原子化 CSS" },
];

export default function LinksPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">友链</h1>
      <p className="text-muted-foreground">
        欢迎互换友链，提交格式：名称 / 链接 / 简介。
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{link.name}</h2>
              <span className="text-xs text-muted-foreground group-hover:text-accent-foreground">
                点击前往
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground group-hover:text-accent-foreground">
              {link.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

