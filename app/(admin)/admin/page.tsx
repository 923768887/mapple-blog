import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FilePenLine, 
  Eye, 
  TrendingUp, 
  PenSquare, 
  Tags, 
  FolderOpen,
  ArrowRight,
  Calendar,
  BarChart3
} from "lucide-react";
import Link from "next/link";

// 获取统计数据（顺序查询避免连接池溢出）
async function getStats() {
  // 文章总数
  const totalPosts = await prisma.post.count();
  // 草稿数
  const draftPosts = await prisma.post.count({
    where: { status: "DRAFT" },
  });
  // 已发布数
  const publishedPosts = await prisma.post.count({
    where: { status: "PUBLISHED" },
  });
  // 总阅读量
  const totalViews = await prisma.post.aggregate({
    _sum: { views: true },
  });
  // 最近发布的 5 篇文章
  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      views: true,
    },
  });
  // 分类数量
  const categories = await prisma.category.count();
  // 标签数量
  const tags = await prisma.tag.count();

  return {
    totalPosts,
    draftPosts,
    publishedPosts,
    totalViews: totalViews._sum.views || 0,
    recentPosts,
    categories,
    tags,
  };
}

// 格式化日期
function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// 格式化相对时间
function formatRelativeTime(date: Date | null): string {
  if (!date) return "-";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return formatDate(date);
}

// 统计卡片组件
function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className = ""
}: { 
  title: string; 
  value: number | string; 
  description: string; 
  icon: React.ElementType;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-full bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
      {/* 装饰性背景 */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
    </Card>
  );
}

// 快速操作按钮组件
function QuickActionButton({
  href,
  icon: Icon,
  title,
  description,
  variant = "default"
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "default" | "primary";
}) {
  return (
    <Link href={href} className="block group">
      <div className={`
        flex items-center gap-4 rounded-xl border p-4 transition-all duration-200
        ${variant === "primary" 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "hover:bg-accent hover:border-primary/20 hover:shadow-sm"
        }
      `}>
        <div className={`
          rounded-lg p-2.5
          ${variant === "primary" 
            ? "bg-primary-foreground/20" 
            : "bg-primary/10"
          }
        `}>
          <Icon className={`h-5 w-5 ${variant === "primary" ? "" : "text-primary"}`} />
        </div>
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className={`text-xs ${variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            {description}
          </div>
        </div>
        <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${variant === "primary" ? "" : "text-muted-foreground"}`} />
      </div>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  const stats = await getStats();

  // 获取当前时间段问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="space-y-8">
      {/* 欢迎信息 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}，{session?.name || "管理员"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            欢迎回到博客管理后台，今天想写点什么？
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/admin/posts/new">
            <PenSquare className="h-4 w-4" />
            写新文章
          </Link>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="文章总数"
          value={stats.totalPosts}
          description="所有文章（含草稿）"
          icon={FileText}
        />
        <StatCard
          title="已发布"
          value={stats.publishedPosts}
          description="公开可见的文章"
          icon={Eye}
        />
        <StatCard
          title="草稿箱"
          value={stats.draftPosts}
          description="待发布的文章"
          icon={FilePenLine}
        />
        <StatCard
          title="总阅读量"
          value={stats.totalViews.toLocaleString()}
          description="累计文章浏览"
          icon={BarChart3}
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 最近文章 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                最近文章
              </CardTitle>
              <CardDescription>最近发布的文章动态</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts" className="gap-1">
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">暂无已发布的文章</p>
                <Button asChild>
                  <Link href="/admin/posts/new">写第一篇文章</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                          {post.title}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeTime(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views} 阅读
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickActionButton
              href="/admin/posts/new"
              icon={PenSquare}
              title="新建文章"
              description="创建新的博客文章"
              variant="primary"
            />
            <QuickActionButton
              href="/admin/posts"
              icon={FileText}
              title="文章管理"
              description={`管理 ${stats.totalPosts} 篇文章`}
            />
            <QuickActionButton
              href="/admin/categories"
              icon={FolderOpen}
              title="分类管理"
              description={`${stats.categories} 个分类`}
            />
            <QuickActionButton
              href="/admin/tags"
              icon={Tags}
              title="标签管理"
              description={`${stats.tags} 个标签`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
