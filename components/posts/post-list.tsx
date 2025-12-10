"use client";

import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard, PostCardData } from "./post-card";
import { Pagination } from "./pagination";

interface PostListProps {
  posts: PostCardData[];
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

/**
 * 文章列表组件
 * 显示文章卡片列表和分页控件
 * 支持空状态展示和精选文章
 */
export function PostList({
  posts,
  currentPage,
  totalPages,
  basePath = "/",
}: PostListProps) {
  // 空状态
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h3 className="mb-2 text-xl font-semibold">暂无文章</h3>
        <p className="mb-6 max-w-sm text-muted-foreground">
          还没有发布任何文章，敬请期待精彩内容！
        </p>
        <Link href="/admin/posts/new">
          <Button variant="outline" className="gap-2">
            <PenLine className="h-4 w-4" />
            写第一篇文章
          </Button>
        </Link>
      </div>
    );
  }

  // 判断是否有置顶文章（第一页的第一篇）
  const featuredPost = currentPage === 1 ? posts[0] : null;
  const regularPosts = currentPage === 1 ? posts.slice(1) : posts;

  return (
    <div className="space-y-8">
      {/* 置顶/精选文章 - 仅在第一页显示 */}
      {featuredPost && (
        <FeaturedPostCard post={featuredPost} />
      )}

      {/* 文章卡片网格 */}
      {regularPosts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {regularPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
        />
      )}
    </div>
  );
}

// 精选文章卡片
function FeaturedPostCard({ post }: { post: PostCardData }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted transition-all duration-300 hover:shadow-xl hover:border-primary/20">
      <div className="grid md:grid-cols-2 gap-0">
        {/* 封面图 */}
        {post.coverUrl ? (
          <Link 
            href={`/posts/${post.slug}`}
            className="relative aspect-[16/10] md:aspect-auto overflow-hidden"
          >
            <img
              src={post.coverUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
          </Link>
        ) : (
          <div className="hidden md:flex items-center justify-center bg-muted min-h-[200px]">
            <FileText className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}
        
        {/* 内容 */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              精选文章
            </span>
            {post.category && (
              <Link 
                href={`/categories/${post.category.slug}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {post.category.name}
              </Link>
            )}
          </div>
          
          <Link href={`/posts/${post.slug}`}>
            <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          
          {post.summary && (
            <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 mb-4">
              {post.summary}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <time>
                  {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                </time>
              )}
              <span>{post.views} 阅读</span>
            </div>
            
            <Link href={`/posts/${post.slug}`}>
              <Button variant="ghost" size="sm" className="gap-1 group/btn">
                阅读全文
                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
