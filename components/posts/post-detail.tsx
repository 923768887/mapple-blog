"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { TableOfContents } from "./table-of-contents";
import type { TocItem } from "@/lib/markdown";

// 文章详情数据类型
export interface PostDetailData {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  coverUrl: string | null;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// 相邻文章数据类型
export interface AdjacentPost {
  slug: string;
  title: string;
}

interface PostDetailProps {
  /** 文章数据 */
  post: PostDetailData;
  /** 渲染后的 HTML 内容 */
  html: string;
  /** 目录数据 */
  toc: TocItem[];
  /** 上一篇文章 */
  prevPost?: AdjacentPost | null;
  /** 下一篇文章 */
  nextPost?: AdjacentPost | null;
}

/**
 * 文章详情组件
 * 显示完整的文章内容，包括标题、封面、元信息、正文和导航
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function PostDetail({
  post,
  html,
  toc,
  prevPost,
  nextPost,
}: PostDetailProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="relative lg:flex lg:gap-8">
        {/* 主内容区 */}
        <main className="min-w-0 flex-1">
          {/* 文章头部 */}
          <header className="mb-8 space-y-4">
            {/* 分类 */}
            {post.category && (
              <Link
                href={`/categories/${post.category.slug}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {post.category.name}
              </Link>
            )}

            {/* 标题 */}
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              {post.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {/* 作者 */}
              <div className="flex items-center gap-2">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name || "作者"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                    {(post.author.name || post.author.email)[0].toUpperCase()}
                  </div>
                )}
                <span>{post.author.name || post.author.email}</span>
              </div>

              <span>·</span>

              {/* 发布日期 */}
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              )}

              <span>·</span>

              {/* 阅读量 */}
              <span>{post.views} 阅读</span>
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Badge variant="secondary">{tag.name}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* 封面图 */}
          {post.coverUrl && (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={post.coverUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            </div>
          )}

          {/* 文章正文 */}
          <MarkdownRenderer html={html} className="mb-12" />

          {/* 上一篇/下一篇导航 */}
          <nav className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:justify-between">
            {/* 上一篇 */}
            <div className="flex-1">
              {prevPost ? (
                <Link
                  href={`/posts/${prevPost.slug}`}
                  className="group block rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <span className="text-xs text-muted-foreground">上一篇</span>
                  <p className="mt-1 font-medium group-hover:text-primary">
                    {prevPost.title}
                  </p>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  没有更早的文章了
                </div>
              )}
            </div>

            {/* 下一篇 */}
            <div className="flex-1">
              {nextPost ? (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="group block rounded-lg border p-4 text-right transition-colors hover:bg-muted"
                >
                  <span className="text-xs text-muted-foreground">下一篇</span>
                  <p className="mt-1 font-medium group-hover:text-primary">
                    {nextPost.title}
                  </p>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  没有更新的文章了
                </div>
              )}
            </div>
          </nav>
        </main>

        {/* 侧边栏 - 目录（固定在右侧） */}
        <aside className="hidden lg:block lg:w-60 lg:shrink-0">
          <div className="sticky top-20">
            <TableOfContents toc={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
