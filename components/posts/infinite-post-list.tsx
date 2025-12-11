"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { PostCard, PostCardData } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface InfinitePostListProps {
  // 初始文章数据（SSR）
  initialPosts: PostCardData[];
  // 初始分页信息
  initialHasMore: boolean;
  // 筛选条件
  tagSlug?: string;
  categorySlug?: string;
  // 每页数量
  pageSize?: number;
}

/**
 * 无限滚动文章列表组件
 */
export function InfinitePostList({
  initialPosts,
  initialHasMore,
  tagSlug,
  categorySlug,
  pageSize = 10,
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 加载更多文章
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(pageSize),
      });
      if (tagSlug) params.set("tagSlug", tagSlug);
      if (categorySlug) params.set("categorySlug", categorySlug);

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setPage((prev) => prev + 1);
        setHasMore(data.pagination.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("加载更多文章失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, tagSlug, categorySlug, isLoading, hasMore]);

  // 设置 Intersection Observer 监听滚动
  useEffect(() => {
    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: "100px", // 提前 100px 开始加载
        threshold: 0.1,
      }
    );

    // 观察加载更多的触发元素
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // 当筛选条件变化时重置
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialPosts, initialHasMore, tagSlug, categorySlug]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-muted-foreground">
          暂无文章
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          还没有发布任何文章，敬请期待
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 文章网格 - 第一篇为特色文章 */}
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post, index) => (
          <PostCard 
            key={post.id} 
            post={post} 
            featured={index === 0 && posts.length > 1}
          />
        ))}
      </div>

      {/* 加载更多触发区域 */}
      <div ref={loadMoreRef} className="py-8">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">正在加载更多文章...</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="h-px w-12 bg-border" />
            <span>已经到底了</span>
            <span className="h-px w-12 bg-border" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 无限滚动列表骨架屏
 */
export function InfinitePostListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* 特色文章骨架 */}
      <div className="sm:col-span-2 sm:flex rounded-2xl border overflow-hidden">
        <Skeleton className="aspect-[16/9] sm:aspect-auto sm:w-1/2" />
        <div className="flex-1 p-5 sm:p-6 space-y-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center pt-4 border-t">
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      {/* 普通文章骨架 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border overflow-hidden">
          <Skeleton className="aspect-[16/9]" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center pt-3 border-t">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
