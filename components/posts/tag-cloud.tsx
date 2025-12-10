"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 标签数据类型
export interface TagData {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

interface TagCloudProps {
  tags: TagData[];
  activeSlug?: string;
  className?: string;
}

/**
 * 标签云组件
 * 显示所有标签，支持高亮当前选中的标签
 */
export function TagCloud({ tags, activeSlug, className }: TagCloudProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-muted-foreground">标签</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge
              variant={activeSlug === tag.slug ? "default" : "secondary"}
              className={cn(
                "cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground",
                activeSlug === tag.slug && "bg-primary text-primary-foreground"
              )}
            >
              {tag.name}
              {tag.postCount !== undefined && (
                <span className="ml-1 opacity-70">({tag.postCount})</span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
