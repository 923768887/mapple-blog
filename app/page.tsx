import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { PostList, TagCloud, PostCardData, TagData } from "@/components/posts";
import { Skeleton } from "@/components/ui/skeleton";

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
  // 构建查询条件 - 仅返回已发布文章
  const where: {
    status: "PUBLISHED";
    tags?: { some: { tag: { slug: string } } };
    category?: { slug: string };
  } = {
    status: "PUBLISHED",
  };

  // 按标签筛选
  if (tagSlug) {
    where.tags = {
      some: {
        tag: {
          slug: tagSlug,
        },
      },
    };
  }

  // 按分类筛选
  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

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

// 标签云内容组件
async function TagCloudContent({ activeSlug }: { activeSlug?: string }) {
  const tags = await getTags();
  return <TagCloud tags={tags} activeSlug={activeSlug} />;
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
        {/* 主内容区 - 文章列表 */}
        <main>
          <h1 className="mb-6 text-2xl font-bold">
            {tagSlug ? `标签: ${tagSlug}` : categorySlug ? `分类: ${categorySlug}` : "最新文章"}
          </h1>
          <Suspense fallback={<PostListSkeleton />}>
            <PostListContent
              page={page}
              tagSlug={tagSlug}
              categorySlug={categorySlug}
            />
          </Suspense>
        </main>

        {/* 侧边栏 - 标签云 */}
        <aside className="space-y-6">
          <Suspense fallback={<TagCloudSkeleton />}>
            <TagCloudContent activeSlug={tagSlug} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
