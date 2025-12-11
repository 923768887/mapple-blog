"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// 预定义的渐变色组合（美观的配色方案）
const gradientPresets = [
  { from: "#667eea", to: "#764ba2" }, // 紫蓝渐变
  { from: "#f093fb", to: "#f5576c" }, // 粉红渐变
  { from: "#4facfe", to: "#00f2fe" }, // 蓝青渐变
  { from: "#43e97b", to: "#38f9d7" }, // 绿青渐变
  { from: "#fa709a", to: "#fee140" }, // 粉黄渐变
  { from: "#a8edea", to: "#fed6e3" }, // 薄荷粉渐变
  { from: "#ff9a9e", to: "#fecfef" }, // 珊瑚粉渐变
  { from: "#a18cd1", to: "#fbc2eb" }, // 薰衣草渐变
  { from: "#ffecd2", to: "#fcb69f" }, // 桃色渐变
  { from: "#667eea", to: "#f093fb" }, // 紫粉渐变
  { from: "#30cfd0", to: "#330867" }, // 青紫渐变
  { from: "#f8b500", to: "#ff6f61" }, // 橙红渐变
];

/**
 * 根据字符串生成一致的哈希值
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * 根据文章标题生成渐变背景样式
 */
function generateGradient(title: string): { background: string; angle: number } {
  const hash = hashString(title);
  const preset = gradientPresets[hash % gradientPresets.length];
  const angle = (hash % 360);
  
  return {
    background: `linear-gradient(${angle}deg, ${preset.from}, ${preset.to})`,
    angle,
  };
}

/**
 * 获取标题的首个有意义字符（跳过标点符号）
 */
function getFirstChar(title: string): string {
  // 移除常见的标点符号和空格
  const cleaned = title.replace(/^[\s\p{P}]+/u, '');
  return cleaned.charAt(0).toUpperCase() || title.charAt(0).toUpperCase();
}

/**
 * 生成的封面组件
 */
function GeneratedCover({ title, featured }: { title: string; featured: boolean }) {
  const gradient = generateGradient(title);
  const firstChar = getFirstChar(title);
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        featured ? "h-full min-h-[200px]" : "aspect-[16/9]"
      )}
      style={{ background: gradient.background }}
    >
      {/* 装饰图案 */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-white/30 blur-3xl"
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-black/20 blur-3xl"
        />
      </div>
      
      {/* 网格图案 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* 首字显示 */}
      <span 
        className={cn(
          "relative font-bold text-white/90 drop-shadow-lg select-none",
          "transition-transform duration-500 group-hover:scale-110",
          featured ? "text-7xl sm:text-8xl" : "text-6xl"
        )}
      >
        {firstChar}
      </span>
      
      {/* 底部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

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
          // 无封面时显示渐变背景 + 首字
          <GeneratedCover title={post.title} featured={featured} />
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
