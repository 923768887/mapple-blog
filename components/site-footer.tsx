export function SiteFooter() {
  return (
    <footer className="border-t bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} My Blog. All rights reserved.</p>
        <p className="text-xs">Built with Next.js · Tailwind · Shadcn UI</p>
      </div>
    </footer>
  );
}

