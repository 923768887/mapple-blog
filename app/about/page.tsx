import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { generateStaticPageMetadata } from "@/lib/metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Mail, 
  Calendar,
  Sparkles,
  Code2,
  Heart,
  Coffee,
  ArrowRight
} from "lucide-react";

// 强制动态渲染
export const dynamic = "force-dynamic";

/**
 * 关于页面元数据
 */
export const metadata: Metadata = generateStaticPageMetadata(
  "关于本站",
  "了解博客作者的背景、技术方向和写作主题"
);

// 获取关于页面设置
async function getAboutSettings() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "aboutAvatar",
            "aboutName",
            "aboutTitle",
            "aboutBio",
            "aboutSkills",
            "aboutLocation",
            "socialGithub",
            "socialTwitter",
            "socialEmail",
            "siteAuthor",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return {
      avatar: settingsMap.aboutAvatar || "",
      name: settingsMap.aboutName || settingsMap.siteAuthor || "博主",
      title: settingsMap.aboutTitle || "博客作者",
      bio: settingsMap.aboutBio || "这里是个人简介，可以在后台设置中修改。",
      skills: settingsMap.aboutSkills || "",
      location: settingsMap.aboutLocation || "",
      github: settingsMap.socialGithub || "",
      twitter: settingsMap.socialTwitter || "",
      email: settingsMap.socialEmail || "",
    };
  } catch {
    return {
      avatar: "",
      name: "博主",
      title: "博客作者",
      bio: "这里是个人简介，可以在后台设置中修改。",
      skills: "",
      location: "",
      github: "",
      twitter: "",
      email: "",
    };
  }
}

// 获取博客统计
async function getBlogStats() {
  try {
    const postCount = await prisma.post.count({ where: { status: "PUBLISHED" } });
    const tagCount = await prisma.tag.count();
    const categoryCount = await prisma.category.count();
    const totalViews = await prisma.post.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { views: true },
    });

    return {
      postCount,
      tagCount,
      categoryCount,
      totalViews: totalViews._sum.views || 0,
    };
  } catch {
    return { postCount: 0, tagCount: 0, categoryCount: 0, totalViews: 0 };
  }
}

export default async function AboutPage() {
  const about = await getAboutSettings();
  const stats = await getBlogStats();
  const skills = about.skills ? about.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            {/* 头像 */}
            <div className="relative mb-6">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-xl">
                {about.avatar ? (
                  <Image
                    src={about.avatar}
                    alt={about.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                    <span className="text-4xl font-bold text-primary">
                      {about.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* 在线状态指示器 */}
              <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
            </div>

            {/* 名字和头衔 */}
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {about.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {about.title}
            </p>

            {/* 位置 */}
            {about.location && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{about.location}</span>
              </div>
            )}

            {/* 社交链接 */}
            <div className="mt-6 flex items-center gap-3">
              {about.github && (
                <Link href={about.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </Link>
              )}
              {about.email && (
                <Link href={`mailto:${about.email}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    邮箱
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 主要内容 */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* 左侧：个人简介 */}
          <div className="md:col-span-2 space-y-8">
            {/* 关于我 */}
            <section>
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                关于我
              </h2>
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {about.bio}
                </p>
              </div>
            </section>

            {/* 技能标签 */}
            {skills.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                  <Code2 className="h-5 w-5 text-primary" />
                  技术栈
                </h2>
                <div className="rounded-2xl border bg-card p-6">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 写作方向 */}
            <section>
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Heart className="h-5 w-5 text-primary" />
                写作方向
              </h2>
              <div className="rounded-2xl border bg-card p-6">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>前端工程化、React/Next.js、Tailwind CSS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>全栈开发实践与部署运维</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>个人成长与效率工具分享</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* 右侧：统计信息 */}
          <div className="space-y-6">
            {/* 博客统计 */}
            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <Coffee className="h-4 w-4 text-primary" />
                博客统计
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.postCount}</div>
                  <div className="text-xs text-muted-foreground">篇文章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.tagCount}</div>
                  <div className="text-xs text-muted-foreground">个标签</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.categoryCount}</div>
                  <div className="text-xs text-muted-foreground">个分类</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalViews > 1000 
                      ? `${(stats.totalViews / 1000).toFixed(1)}k` 
                      : stats.totalViews}
                  </div>
                  <div className="text-xs text-muted-foreground">次阅读</div>
                </div>
              </div>
            </div>

            {/* 快速链接 */}
            <div className="rounded-2xl border p-6">
              <h3 className="text-sm font-semibold mb-4">快速链接</h3>
              <div className="space-y-2">
                <Link 
                  href="/" 
                  className="flex items-center justify-between rounded-lg p-2 -mx-2 hover:bg-muted transition-colors group"
                >
                  <span className="text-sm">浏览文章</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link 
                  href="/tags" 
                  className="flex items-center justify-between rounded-lg p-2 -mx-2 hover:bg-muted transition-colors group"
                >
                  <span className="text-sm">标签云</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link 
                  href="/links" 
                  className="flex items-center justify-between rounded-lg p-2 -mx-2 hover:bg-muted transition-colors group"
                >
                  <span className="text-sm">友情链接</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>

            {/* 建站时间 */}
            <div className="rounded-2xl border p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                本站已运行
              </p>
              <p className="text-lg font-semibold mt-1">
                {Math.floor((Date.now() - new Date("2024-01-01").getTime()) / (1000 * 60 * 60 * 24))} 天
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
