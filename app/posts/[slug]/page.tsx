import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { parseMarkdown } from "@/lib/markdown";
import { PostDetail, PostDetailData, AdjacentPost } from "@/components/posts";
import { generatePostMetadata } from "@/lib/metadata";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 获取文章基础数据（使用 React cache 避免重复查询）
 */
const getPostData = cache(async (slug: string) => {
  return prisma.post.findUnique({
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
});

/**
 * 获取文章详情数据
 */
async function getPost(slug: string): Promise<PostDetailData | null> {
  const post = await getPostData(slug);

  // 文章不存在或未发布
  if (!post || post.status !== "PUBLISHED") {
    return null;
  }

  // 异步增加阅读计数（不阻塞页面渲染）
  prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(console.error);

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
 * 生成页面元数据（使用缓存的数据避免重复查询）
 * 包含 Open Graph 和 Twitter Card 元数据
 * Requirements: 9.1, 9.2
 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // 使用缓存的查询函数
  const post = await getPostData(slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  // 使用统一的元数据生成工具函数
  return generatePostMetadata({
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverUrl: post.coverUrl,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: {
      name: post.author.name,
    },
    tags: post.tags.map((pt) => ({ name: pt.tag.name })),
  });
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
