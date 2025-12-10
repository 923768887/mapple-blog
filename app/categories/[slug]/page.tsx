import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostList, TagCloud, PostCardData, TagData } from "@/components/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateCategoryMetadata } from "@/lib/metadata";

// 每页显示的文章数量
const PAGE_SIZE = 10;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// 分类数据类型
interface CategoryData {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

// 获取分类信息
async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  return category;
}

// 获取分类下的文章列表
async function getPostsByCategory(
  categorySlug: string,
  page: number
): Promise<{
  posts: PostCardData[];
  total: number;
}> {
  // 构建查询条件 - 仅返回已发布文章且属于该分类
  const where = {
    status: "PUBLISHED" as const,
    category: {
      slug: categorySlug,
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

// 获取所有分类
async function getCategories(): Promise<CategoryData[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    postCount: category._count.posts,
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

// 侧边栏骨架屏
function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-12" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-12" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 文章列表内容组件
async function PostListContent({
  categorySlug,
  page,
}: {
  categorySlug: string;
  page: number;
}) {
  const { posts, total } = await getPostsByCategory(categorySlug, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PostList
      posts={posts}
      currentPage={page}
      totalPages={totalPages}
      basePath={`/categories/${categorySlug}`}
    />
  );
}

// 侧边栏内容组件
async function SidebarContent({ activeSlug }: { activeSlug: string }) {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <>
      {/* 分类列表 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">分类</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Badge
                variant={activeSlug === category.slug ? "default" : "secondary"}
                className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {category.name}
                {category.postCount !== undefined && (
                  <span className="ml-1 opacity-70">({category.postCount})</span>
                )}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* 标签云 */}
      <TagCloud tags={tags} />
    </>
  );
}

/**
 * 分类文章列表页面
 * 显示指定分类下的所有已发布文章
 * Requirements: 1.4
 */
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  // 获取分类信息
  const category = await getCategory(slug);

  // 分类不存在时返回 404
  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
        {/* 主内容区 - 文章列表 */}
        <main>
          {/* 分类标题 */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">分类</span>
            <span className="text-muted-foreground">/</span>
            <Badge variant="default" className="text-base">
              {category.name}
            </Badge>
          </div>

          <h1 className="mb-6 text-2xl font-bold">分类: {category.name}</h1>

          <Suspense fallback={<PostListSkeleton />}>
            <PostListContent categorySlug={slug} page={page} />
          </Suspense>
        </main>

        {/* 侧边栏 */}
        <aside className="space-y-6">
          <Suspense fallback={<SidebarSkeleton />}>
            <SidebarContent activeSlug={slug} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

// 生成页面元数据
// Requirements: 9.1
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "分类未找到",
    };
  }

  return generateCategoryMetadata(category.name);
}
