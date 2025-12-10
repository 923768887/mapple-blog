import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostList, TagCloud, PostCardData, TagData } from "@/components/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  BookOpen,
  Rss
} from "lucide-react";

// 强制动态渲染，避免构建时数据库连接问题
export const dynamic = "force-dynamic";

// 每页显示的文章数量
const PAGE_SIZE = 10;

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    tagSlug?: string;
    categorySlug?: string;
  }>;
}

// 获取文章列表数据
async function getPosts(
  page: number,
  tagSlug?: string,
  categorySlug?: string
): Promise<{
  posts: PostCardData[];
  total: number;
}> {
  const where: {
    status: "PUBLISHED";
    tags?: { some: { tag: { slug: string } } };
    category?: { slug: string };
  } = {
    status: "PUBLISHED",
  };

  if (tagSlug) {
    where.tags = {
      some: {
        tag: {
          slug: tagSlug,
        },
      },
    };
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  const total = await prisma.post.count({ where });

  const posts = await prisma.post.findMany({
    where,
    orderBy: {
      publishedAt: "desc",
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const transformedPosts: PostCardData[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverUrl: post.coverUrl,
    views: post.views,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: post.author,
    category: post.category,
    tags: post.tags.map((pt) => pt.tag),
  }));

  return {
    posts: transformedPosts,
    total,
  };
}

// 获取热门文章
async function getPopularPosts(): Promise<PostCardData[]> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { views: "desc" },
    take: 5,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverUrl: post.coverUrl,
    views: post.views,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: post.author,
    category: post.category,
    tags: post.tags.map((pt) => pt.tag),
  }));
}

// 获取所有标签
async function getTags(): Promise<TagData[]> {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postCount: tag._count.posts,
  }));
}

// 获取分类
async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return categories;
}

// 获取统计数据（顺序查询避免连接池溢出）
async function getStats() {
  const postCount = await prisma.post.count({ where: { status: "PUBLISHED" } });
  const tagCount = await prisma.tag.count();
  const totalViews = await prisma.post.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { views: true },
  });

  return {
    postCount,
    tagCount,
    totalViews: totalViews._sum.views || 0,
  };
}

// 骨架屏组件
function PostListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border p-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 文章列表内容
async function PostListContent({
  page,
  tagSlug,
  categorySlug,
}: {
  page: number;
  tagSlug?: string;
  categorySlug?: string;
}) {
  const { posts, total } = await getPosts(page, tagSlug, categorySlug);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PostList
      posts={posts}
      currentPage={page}
      totalPages={totalPages}
      basePath="/"
    />
  );
}

// 侧边栏内容（顺序查询避免连接池溢出）
async function SidebarContent({ activeSlug }: { activeSlug?: string }) {
  const tags = await getTags();
  const categories = await getCategories();
  const popularPosts = await getPopularPosts();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      {/* 博客统计 */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          博客统计
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-background/80 p-3">
            <div className="text-2xl font-bold text-primary">{stats.postCount}</div>
            <div className="text-xs text-muted-foreground">文章</div>
          </div>
          <div className="rounded-lg bg-background/80 p-3">
            <div className="text-2xl font-bold text-primary">{stats.tagCount}</div>
            <div className="text-xs text-muted-foreground">标签</div>
          </div>
          <div className="rounded-lg bg-background/80 p-3">
            <div className="text-2xl font-bold text-primary">
              {stats.totalViews > 1000 
                ? `${(stats.totalViews / 1000).toFixed(1)}k` 
                : stats.totalViews}
            </div>
            <div className="text-xs text-muted-foreground">阅读</div>
          </div>
        </div>
      </div>

      {/* 热门文章 */}
      {popularPosts.length > 0 && (
        <div className="rounded-xl border p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            热门文章
          </h3>
          <div className="space-y-3">
            {popularPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group flex items-start gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted"
              >
                <span className={`
                  flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold
                  ${index === 0 ? 'bg-orange-500 text-white' : 
                    index === 1 ? 'bg-orange-400 text-white' : 
                    index === 2 ? 'bg-orange-300 text-white' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.views} 阅读
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 分类 */}
      {categories.length > 0 && (
        <div className="rounded-xl border p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
            <BookOpen className="h-4 w-4 text-blue-500" />
            文章分类
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex items-center justify-between rounded-lg p-2 -mx-2 transition-colors hover:bg-muted group"
              >
                <span className="text-sm group-hover:text-primary transition-colors">
                  {category.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {category._count.posts}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 标签云 */}
      <div className="rounded-xl border p-5">
        <TagCloud tags={tags} activeSlug={activeSlug} />
      </div>

      {/* 订阅 */}
      <div className="rounded-xl border bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Rss className="h-4 w-4 text-orange-500" />
          订阅更新
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          通过 RSS 订阅获取最新文章
        </p>
        <Link href="/rss.xml" target="_blank">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Rss className="h-4 w-4" />
            RSS 订阅
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * 首页 - 文章列表
 * Requirements: 1.1, 1.2, 1.5
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const tagSlug = params.tagSlug;
  const categorySlug = params.categorySlug;
  const isFiltered = !!tagSlug || !!categorySlug;

  return (
    <div className="min-h-screen">
      {/* Hero 区域 - 仅在首页第一页且无筛选时显示 */}
      {page === 1 && !isFiltered && (
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
          {/* 装饰背景 */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-4 gap-1">
                <Sparkles className="h-3 w-3" />
                欢迎来到我的博客
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                探索技术的
                <span className="text-primary">无限可能</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                分享编程心得、技术探索与生活感悟。在这里，我们一起学习、成长、创造。
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="#posts">
                  <Button size="lg" className="gap-2">
                    开始阅读
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 主内容区 */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12" id="posts">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:gap-12">
          {/* 文章列表 */}
          <main>
            {/* 标题区域 */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">
                  {tagSlug 
                    ? `标签: ${tagSlug}` 
                    : categorySlug 
                    ? `分类: ${categorySlug}` 
                    : "最新文章"}
                </h2>
              </div>
              {isFiltered && (
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1">
                    查看全部
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            
            <Suspense fallback={<PostListSkeleton />}>
              <PostListContent
                page={page}
                tagSlug={tagSlug}
                categorySlug={categorySlug}
              />
            </Suspense>
          </main>

          {/* 侧边栏 */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <Suspense fallback={<SidebarSkeleton />}>
                <SidebarContent activeSlug={tagSlug} />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
