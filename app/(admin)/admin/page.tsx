import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FilePenLine, Eye } from "lucide-react";
import Link from "next/link";

// 获取统计数据
async function getStats() {
  const [totalPosts, draftPosts, publishedPosts, recentPosts] = await Promise.all([
    // 文章总数
    prisma.post.count(),
    // 草稿数
    prisma.post.count({
      where: { status: "DRAFT" },
    }),
    // 已发布数
    prisma.post.count({
      where: { status: "PUBLISHED" },
    }),
    // 最近发布的 5 篇文章（按发布时间降序）
    prisma.post.findMany({
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
    }),
  ]);

  return {
    totalPosts,
    draftPosts,
    publishedPosts,
    recentPosts,
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


export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getStats();

  return (
    <>
      {/* 欢迎信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            欢迎回来，{session?.user?.name || "管理员"}
          </h1>
          <p className="text-muted-foreground">
            这是您的博客管理仪表盘
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文章总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              所有文章（含草稿）
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿数</CardTitle>
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftPosts}</div>
            <p className="text-xs text-muted-foreground">
              待发布的文章
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              公开可见的文章
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 最近文章和快速操作 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>最近文章</CardTitle>
            <CardDescription>最近发布的 5 篇文章</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                暂无已发布的文章
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="font-medium hover:underline"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>·</span>
                        <span>{post.views} 次阅读</span>
                      </div>
                    </div>
                    <Badge variant="secondary">已发布</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/posts/new"
              className="block rounded-md border p-3 hover:bg-accent transition-colors"
            >
              <div className="font-medium">新建文章</div>
              <div className="text-xs text-muted-foreground">创建新的博客文章</div>
            </Link>
            <Link
              href="/admin/tags"
              className="block rounded-md border p-3 hover:bg-accent transition-colors"
            >
              <div className="font-medium">管理标签</div>
              <div className="text-xs text-muted-foreground">添加或编辑文章标签</div>
            </Link>
            <Link
              href="/admin/categories"
              className="block rounded-md border p-3 hover:bg-accent transition-colors"
            >
              <div className="font-medium">管理分类</div>
              <div className="text-xs text-muted-foreground">组织文章分类结构</div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
