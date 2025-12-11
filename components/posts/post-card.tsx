"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// 文章卡片数据类型
export interface PostCardData {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  views: number;
  publishedAt: string | null;
  author: {
    id: string;
    name: string | null;
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

interface PostCardProps {
  post: PostCardData;
  // 是否为特色文章（第一篇）
  featured?: boolean;
}

/**
 * 文章卡片组件
 * 现代化设计，支持特色文章展示
 */
export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        featured && "sm:col-span-2 sm:flex-row"
      )}
    >
      {/* 封面图区域 */}
      <Link
        href={`/posts/${post.slug}`}
        prefetch={true}
        className={cn(
          "relative block overflow-hidden bg-muted",
          featured ? "sm:w-1/2" : "aspect-[16/9]"
        )}
      >
        {post.coverUrl ? (
          <>
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes={featured 
                ? "(max-width: 640px) 100vw, 50vw" 
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              loading="lazy"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          // 无封面时的占位
          <div className={cn(
            "flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5",
            featured ? "h-full min-h-[200px]" : "aspect-[16/9]"
          )}>
            <span className="text-4xl opacity-50">📝</span>
          </div>
        )}

        {/* 分类标签 - 悬浮在图片上 */}
        {post.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge 
              className="bg-white/90 text-foreground backdrop-blur-sm hover:bg-white shadow-sm"
            >
              {post.category.name}
            </Badge>
          </div>
        )}

        {/* 阅读量 - 悬浮在图片右上角 */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            <span>{post.views}</span>
          </div>
        </div>
      </Link>

      {/* 内容区域 */}
      <div className={cn(
        "flex flex-1 flex-col p-5",
        featured && "sm:p-6 sm:justify-center"
      )}>
        {/* 标题 */}
        <h2 className={cn(
          "font-bold leading-tight tracking-tight",
          featured ? "text-xl sm:text-2xl" : "text-lg",
          "line-clamp-2"
        )}>
          <Link
            href={`/posts/${post.slug}`}
            prefetch={true}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>

        {/* 摘要 */}
        {post.summary && (
          <p className={cn(
            "mt-3 text-muted-foreground leading-relaxed",
            featured ? "line-clamp-3 text-sm sm:text-base" : "line-clamp-2 text-sm"
          )}>
            {post.summary}
          </p>
        )}

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="mt-2 mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, featured ? 4 : 3).map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge
                  variant="secondary"
                  className="text-xs font-normal hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  #{tag.name}
                </Badge>
              </Link>
            ))}
            {post.tags.length > (featured ? 4 : 3) && (
              <Badge variant="outline" className="text-xs font-normal">
                +{post.tags.length - (featured ? 4 : 3)}
              </Badge>
            )}
          </div>
        )}

        {/* 底部信息栏 */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          {/* 发布日期 */}
          {post.publishedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          )}

          {/* 阅读更多按钮 */}
          <Link
            href={`/posts/${post.slug}`}
            prefetch={true}
            className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            阅读
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
