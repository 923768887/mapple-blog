import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { parseMarkdown } from "@/lib/markdown";
import { PostDetail, PostDetailData, AdjacentPost } from "@/components/posts";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 获取文章详情数据
 */
async function getPost(slug: string): Promise<PostDetailData | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
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

  // 文章不存在或未发布
  if (!post || post.status !== "PUBLISHED") {
    return null;
  }

  // 增加阅读计数
  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    summary: post.summary,
    coverUrl: post.coverUrl,
    views: post.views + 1, // 返回更新后的阅读数
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    category: post.category,
    tags: post.tags.map((pt) => pt.tag),
  };
}

/**
 * 获取相邻文章（上一篇和下一篇）
 * 按发布日期排序：上一篇是发布日期更早的最近文章，下一篇是发布日期更晚的最近文章
 * Requirements: 2.4
 */
async function getAdjacentPosts(
  publishedAt: Date
): Promise<{ prev: AdjacentPost | null; next: AdjacentPost | null }> {
  // 获取上一篇（发布日期更早的最近文章）
  const prevPost = await prisma.post.findFirst({
    where: {
      status: "PUBLISHED",
      publishedAt: { lt: publishedAt },
    },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true },
  });

  // 获取下一篇（发布日期更晚的最近文章）
  const nextPost = await prisma.post.findFirst({
    where: {
      status: "PUBLISHED",
      publishedAt: { gt: publishedAt },
    },
    orderBy: { publishedAt: "asc" },
    select: { slug: true, title: true },
  });

  return {
    prev: prevPost,
    next: nextPost,
  };
}

/**
 * 生成页面元数据
 * Requirements: 9.1, 9.2
 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      summary: true,
      coverUrl: true,
    },
  });

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: post.title,
    description: post.summary || undefined,
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      type: "article",
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary || undefined,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

/**
 * 文章详情页
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  // 获取文章数据
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // 解析 Markdown 内容
  const { html, toc } = await parseMarkdown(post.content);

  // 获取相邻文章
  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : new Date();
  const { prev, next } = await getAdjacentPosts(publishedAt);

  return (
    <PostDetail
      post={post}
      html={html}
      toc={toc}
      prevPost={prev}
      nextPost={next}
    />
  );
}
