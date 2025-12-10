"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
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
  showTitle?: boolean;
}

/**
 * 标签云组件
 * 显示所有标签，支持高亮当前选中的标签
 * 根据文章数量调整标签大小
 */
export function TagCloud({ 
  tags, 
  activeSlug, 
  className,
  showTitle = true 
}: TagCloudProps) {
  if (tags.length === 0) {
    return null;
  }

  // 计算标签大小（根据文章数量）
  const maxCount = Math.max(...tags.map(t => t.postCount || 0));
  const minCount = Math.min(...tags.map(t => t.postCount || 0));
  
  const getTagSize = (count: number) => {
    if (maxCount === minCount) return "text-sm";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.7) return "text-base font-medium";
    if (ratio > 0.4) return "text-sm";
    return "text-xs";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showTitle && (
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4 text-green-500" />
          标签云
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = activeSlug === tag.slug;
          const size = getTagSize(tag.postCount || 0);
          
          return (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  "hover:scale-105 hover:shadow-sm",
                  "hover:bg-primary hover:text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  size
                )}
              >
                #{tag.name}
                {tag.postCount !== undefined && tag.postCount > 0 && (
                  <span className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted-foreground/20"
                  )}>
                    {tag.postCount}
                  </span>
                )}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
