"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard, PostCardData } from "@/components/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";

// 搜索响应类型
interface SearchResponse {
  posts: PostCardData[];
  total: number;
  query: string;
}

// 搜索输入组件
function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  isLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
}) {
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="relative flex w-full max-w-2xl items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜索文章标题、摘要或内容..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          aria-label="搜索关键词"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="清除搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button onClick={onSubmit} disabled={isLoading}>
        {isLoading ? "搜索中..." : "搜索"}
      </Button>
    </div>
  );
}

// 搜索结果骨架屏
function SearchResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border p-6">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 空结果状态组件
function EmptyResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="mb-2 text-lg font-medium">未找到相关文章</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        没有找到与 &quot;{query}&quot; 相关的文章
      </p>
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">建议：</p>
        <ul className="list-inside list-disc text-left">
          <li>检查关键词是否有拼写错误</li>
          <li>尝试使用更简短或更通用的关键词</li>
          <li>尝试使用不同的关键词组合</li>
        </ul>
      </div>
    </div>
  );
}

// 初始状态组件
function InitialState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">📚</div>
      <h3 className="mb-2 text-lg font-medium">搜索博客文章</h3>
      <p className="text-sm text-muted-foreground">
        输入关键词搜索文章标题、摘要或内容
      </p>
    </div>
  );
}

// 搜索结果列表组件
function SearchResults({ posts, query }: { posts: PostCardData[]; query: string }) {
  if (posts.length === 0) {
    return <EmptyResults query={query} />;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        找到 {posts.length} 篇与 &quot;{query}&quot; 相关的文章
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

/**
 * 搜索页面
 * Requirements: 3.1, 3.3
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 从 URL 获取初始搜索词
  const initialQuery = searchParams.get("q") || "";
  
  const [inputValue, setInputValue] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<PostCardData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  // 执行搜索
  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    // 空白关键词验证
    if (!trimmedQuery) {
      setError("请输入有效的搜索关键词");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "搜索失败");
      }

      const data: SearchResponse = await response.json();
      setResults(data.posts);
      setSearchQuery(trimmedQuery);
      
      // 更新 URL
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`, { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败，请稍后重试");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 处理提交
  const handleSubmit = () => {
    performSearch(inputValue);
  };

  // 清除搜索
  const handleClear = () => {
    setInputValue("");
    setResults(null);
    setSearchQuery("");
    setHasSearched(false);
    setError(null);
    router.push("/search", { scroll: false });
  };

  // 初始加载时执行搜索（如果 URL 中有查询参数）
  useEffect(() => {
    if (initialQuery && !results && !isLoading) {
      performSearch(initialQuery);
    }
  }, [initialQuery, results, isLoading, performSearch]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">搜索文章</h1>
        
        {/* 搜索输入框 */}
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onClear={handleClear}
          isLoading={isLoading}
        />
        
        {/* 错误提示 */}
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* 搜索结果区域 */}
      <main>
        {isLoading ? (
          <SearchResultsSkeleton />
        ) : hasSearched && results !== null ? (
          <SearchResults posts={results} query={searchQuery} />
        ) : (
          <InitialState />
        )}
      </main>
    </div>
  );
}
