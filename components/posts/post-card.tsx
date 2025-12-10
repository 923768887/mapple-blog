"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

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
}

/**
 * 单篇文章卡片组件
 * 显示文章标题、摘要、标签、发布日期等信息
 * 移动端优化：更紧凑的布局和更好的触摸体验
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 active:scale-[0.99]">
      {/* 封面图 */}
      {post.coverUrl && (
        <Link 
          href={`/posts/${post.slug}`} 
          prefetch={true} 
          className="block overflow-hidden"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              placeholder="empty"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      )}

      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
        {/* 分类 */}
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="inline-block text-xs font-medium text-primary hover:underline mb-1"
          >
            {post.category.name}
          </Link>
        )}
        {/* 标题 */}
        <CardTitle className="text-base sm:text-lg leading-snug">
          <Link
            href={`/posts/${post.slug}`}
            prefetch={true}
            className="line-clamp-2 transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
        {/* 发布日期和阅读量 */}
        <CardDescription className="flex items-center gap-3 text-xs mt-2">
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.views}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {/* 摘要 */}
        {post.summary && (
          <p className="line-clamp-2 sm:line-clamp-3 text-sm text-muted-foreground leading-relaxed">
            {post.summary}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0 flex flex-wrap gap-1.5">
        {/* 标签列表 */}
        {post.tags.slice(0, 3).map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge 
              variant="secondary" 
              className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              #{tag.name}
            </Badge>
          </Link>
        ))}
        {post.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{post.tags.length - 3}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
