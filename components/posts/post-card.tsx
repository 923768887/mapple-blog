"use client";

import Link from "next/link";
import Image from "next/image";
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
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* 封面图 */}
      {post.coverUrl && (
        <Link href={`/posts/${post.slug}`} className="block overflow-hidden">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-2">
        {/* 分类 */}
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {post.category.name}
          </Link>
        )}
        {/* 标题 */}
        <CardTitle className="line-clamp-2">
          <Link
            href={`/posts/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
        {/* 发布日期和阅读量 */}
        <CardDescription className="flex items-center gap-2 text-xs">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          <span>·</span>
          <span>{post.views} 阅读</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {/* 摘要 */}
        {post.summary && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {post.summary}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-1.5">
        {/* 标签列表 */}
        {post.tags.slice(0, 3).map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge variant="secondary" className="text-xs">
              {tag.name}
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
