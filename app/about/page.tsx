import { Metadata } from "next";
import { generateStaticPageMetadata } from "@/lib/metadata";

/**
 * 关于页面元数据
 * Requirements: 9.1
 */
export const metadata: Metadata = generateStaticPageMetadata(
  "关于本站",
  "了解博客作者的背景、技术方向和写作主题"
);

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">关于本站</h1>
      <p className="text-muted-foreground">
        这里是个人博客的关于页，你可以在此介绍作者背景、技术方向、写作主题以及联系/社交方式。
      </p>
      <div className="rounded-xl border p-4">
        <h2 className="text-xl font-semibold">写作方向</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li>前端工程化、Next.js、Tailwind、设计体系</li>
          <li>全栈实践与部署 CI/CD</li>
          <li>个人成长与效率工具</li>
        </ul>
      </div>
    </div>
  );
}

