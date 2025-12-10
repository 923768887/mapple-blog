"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// 标签数据类型
interface TagData {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

/**
 * 标签云页面
 * 显示所有标签，点击可跳转到对应标签的文章列表
 * Requirements: 1.3
 */
export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("获取标签失败");
        }
        const data = await response.json();
        setTags(data.tags || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取标签失败");
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, []);

  // 加载状态
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">标签</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-6xl">😕</div>
          <h3 className="mb-2 text-lg font-medium">加载失败</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // 空状态
  if (tags.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">标签</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-6xl">🏷️</div>
          <h3 className="mb-2 text-lg font-medium">暂无标签</h3>
          <p className="text-sm text-muted-foreground">
            还没有创建任何标签，敬请期待！
          </p>
        </div>
      </div>
    );
  }

  // 计算标签大小（根据文章数量）
  const maxCount = Math.max(...tags.map((t) => t.postCount || 0), 1);
  const getTagSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-xl";
    if (ratio > 0.4) return "text-lg";
    if (ratio > 0.2) return "text-base";
    return "text-sm";
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">标签</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            共 {tags.length} 个标签
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground ${getTagSize(
                    tag.postCount || 0
                  )}`}
                >
                  {tag.name}
                  {tag.postCount !== undefined && (
                    <span className="ml-1 opacity-70">({tag.postCount})</span>
                  )}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
