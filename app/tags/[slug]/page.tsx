import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostList, TagCloud, PostCardData, TagData } from "@/components/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// 每页显示的文章数量
const PAGE_SIZE = 10;

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// 获取标签信息
async function getTag(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });
  return tag;
}

// 获取标签下的文章列表
async function getPostsByTag(
  tagSlug: string,
  page: number
): Promise<{
  posts: PostCardData[];
  total: number;
}> {
  // 构建查询条件 - 仅返回已发布文章且包含该标签
  const where = {
    status: "PUBLISHED" as const,
    tags: {
      some: {
        tag: {
          slug: tagSlug,
        },
      },
    },
  };

  // 获取总数
  const total = await prisma.post.count({ where });

  // 获取文章列表，按发布日期降序排序
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

  // 转换数据格式
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

// 文章列表骨架屏
function PostListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border p-6">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 标签云骨架屏
function TagCloudSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-12" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16" />
        ))}
      </div>
    </div>
  );
}

// 文章列表内容组件
async function PostListContent({
  tagSlug,
  page,
}: {
  tagSlug: string;
  page: number;
}) {
  const { posts, total } = await getPostsByTag(tagSlug, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PostList
      posts={posts}
      currentPage={page}
      totalPages={totalPages}
      basePath={`/tags/${tagSlug}`}
    />
  );
}

// 标签云内容组件
async function TagCloudContent({ activeSlug }: { activeSlug: string }) {
  const tags = await getTags();
  return <TagCloud tags={tags} activeSlug={activeSlug} />;
}

/**
 * 标签文章列表页面
 * 显示指定标签下的所有已发布文章
 * Requirements: 1.3
 */
export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  // 获取标签信息
  const tag = await getTag(slug);

  // 标签不存在时返回 404
  if (!tag) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
        {/* 主内容区 - 文章列表 */}
        <main>
          {/* 标签标题 */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/tags"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              标签
            </Link>
            <span className="text-muted-foreground">/</span>
            <Badge variant="default" className="text-base">
              {tag.name}
            </Badge>
          </div>

          <h1 className="mb-6 text-2xl font-bold">
            标签: {tag.name}
          </h1>

          <Suspense fallback={<PostListSkeleton />}>
            <PostListContent tagSlug={slug} page={page} />
          </Suspense>
        </main>

        {/* 侧边栏 - 标签云 */}
        <aside className="space-y-6">
          <Suspense fallback={<TagCloudSkeleton />}>
            <TagCloudContent activeSlug={slug} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

// 生成页面元数据
export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) {
    return {
      title: "标签未找到",
    };
  }

  return {
    title: `标签: ${tag.name}`,
    description: `查看所有标记为「${tag.name}」的文章`,
  };
}
