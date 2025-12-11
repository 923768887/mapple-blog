"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { List, X, ChevronLeft, ChevronRight, Eye, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDate } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { TableOfContents } from "./table-of-contents";
import type { TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";

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
 * 移动端目录组件
 */
function MobileToc({ 
  toc, 
  onItemClick 
}: { 
  toc: TocItem[]; 
  onItemClick: () => void;
}) {
  const handleClick = (e: React.MouseEvent, item: TocItem) => {
    e.preventDefault();
    
    // 查找标题元素
    let element = document.getElementById(item.id);
    if (!element) {
      const allHeadings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      for (const heading of allHeadings) {
        const headingText = heading.textContent?.trim() || '';
        if (headingText === item.text) {
          element = heading as HTMLElement;
          break;
        }
      }
    }
    
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      
      // 先关闭目录
      onItemClick();
      
      // 延迟滚动，等待 Sheet 关闭动画
      setTimeout(() => {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }, 150);
    }
  };

  const renderItem = (item: TocItem, depth: number = 0) => (
    <li key={item.id}>
      <a
        href={`#${item.id}`}
        onClick={(e) => handleClick(e, item)}
        className={cn(
          "flex items-center gap-3 py-3 px-4 -mx-4 rounded-xl transition-colors",
          "hover:bg-muted active:bg-muted/80",
          depth === 0 ? "font-medium" : "text-muted-foreground"
        )}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <span 
          className={cn(
            "w-2 h-2 rounded-full shrink-0",
            depth === 0 ? "bg-primary" : "bg-muted-foreground/30"
          )} 
        />
        <span className="line-clamp-1">{item.text}</span>
      </a>
      {item.children.length > 0 && (
        <ul>
          {item.children.map((child) => renderItem(child, depth + 1))}
        </ul>
      )}
    </li>
  );

  return (
    <ul className="space-y-1">
      {toc.map((item) => renderItem(item))}
    </ul>
  );
}

/**
 * 文章详情组件
 * 显示完整的文章内容，包括标题、封面、元信息、正文和导航
 * 支持移动端目录浮动按钮
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function PostDetail({
  post,
  html,
  toc,
  prevPost,
  nextPost,
}: PostDetailProps) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
      <div className="relative lg:flex lg:gap-10">
        {/* 主内容区 */}
        <main className="min-w-0 flex-1">
          {/* 文章头部 */}
          <header className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            {/* 分类 */}
            {post.category && (
              <Link
                href={`/categories/${post.category.slug}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <span className="text-muted-foreground">分类:</span>
                {post.category.name}
              </Link>
            )}

            {/* 标题 */}
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {post.title}
            </h1>

            {/* 元信息 - 移动端优化 */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {/* 作者 */}
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name || "作者"}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : null}
                <span>{post.author.name || post.author.email}</span>
              </div>

              {/* 发布日期 */}
              {post.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
              )}

              {/* 阅读量 */}
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{post.views} 阅读</span>
              </div>
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Badge 
                      variant="secondary" 
                      className="text-xs md:text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* 封面图 */}
          {post.coverUrl && (
            <div className="relative mb-6 md:mb-8 aspect-video w-full overflow-hidden rounded-xl shadow-lg">
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
          <MarkdownRenderer html={html} className="mb-8 md:mb-12" />

          {/* 上一篇/下一篇导航 - 移动端优化 */}
          <nav className="flex flex-col gap-3 border-t pt-6 md:pt-8 sm:flex-row sm:gap-4">
            {/* 上一篇 */}
            <div className="flex-1">
              {prevPost ? (
                <Link
                  href={`/posts/${prevPost.slug}`}
                  className="group flex items-start gap-3 rounded-xl border p-4 transition-all hover:bg-muted hover:border-primary/30 hover:shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">上一篇</span>
                    <p className="mt-1 font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {prevPost.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  没有更早的文章了
                </div>
              )}
            </div>

            {/* 下一篇 */}
            <div className="flex-1">
              {nextPost ? (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="group flex items-start gap-3 rounded-xl border p-4 transition-all hover:bg-muted hover:border-primary/30 hover:shadow-sm sm:flex-row-reverse sm:text-right"
                >
                  <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">下一篇</span>
                    <p className="mt-1 font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {nextPost.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  没有更新的文章了
                </div>
              )}
            </div>
          </nav>
        </main>

        {/* 侧边栏 - 目录（桌面端固定在右侧） */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-20">
            <TableOfContents toc={toc} />
          </div>
        </aside>
      </div>

      {/* 移动端目录浮动按钮 */}
      {toc.length > 0 && (
        <Sheet open={tocOpen} onOpenChange={setTocOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl lg:hidden",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-all active:scale-95",
                "ring-4 ring-primary/20"
              )}
              aria-label="打开目录"
            >
              <List className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-[60vh] rounded-t-3xl px-0"
          >
            <SheetHeader className="px-6 pb-4 border-b">
              <SheetTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  文章目录
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  {toc.length} 个章节
                </span>
              </SheetTitle>
            </SheetHeader>
            <div className="px-6 py-4 overflow-y-auto h-[calc(60vh-80px)] scrollbar-hide">
              <MobileToc toc={toc} onItemClick={() => setTocOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
