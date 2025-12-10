"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/markdown";

interface TableOfContentsProps {
  /** 目录数据 */
  toc: TocItem[];
  /** 自定义类名 */
  className?: string;
}

/**
 * 文章目录导航组件
 * 支持点击跳转和当前位置高亮
 * Requirements: 2.3
 */
export function TableOfContents({ toc, className }: TableOfContentsProps) {
  // 当前激活的标题 ID
  const [activeId, setActiveId] = useState<string>("");

  // 监听滚动，更新当前激活的标题
  useEffect(() => {
    if (toc.length === 0) return;

    // 获取所有标题元素
    const getAllIds = (items: TocItem[]): string[] => {
      const ids: string[] = [];
      for (const item of items) {
        ids.push(item.id);
        if (item.children.length > 0) {
          ids.push(...getAllIds(item.children));
        }
      }
      return ids;
    };

    const headingIds = getAllIds(toc);
    const headingElements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // 使用 IntersectionObserver 监听标题可见性
    const observer = new IntersectionObserver(
      (entries) => {
        // 找到第一个可见的标题
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc]);

  // 渲染目录项
  const renderTocItem = (item: TocItem, depth: number = 0) => {
    const isActive = activeId === item.id;
    const paddingLeft = depth * 12;

    return (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById(item.id);
            if (element) {
              // 平滑滚动到目标位置
              element.scrollIntoView({ behavior: "smooth", block: "start" });
              // 更新 URL hash
              window.history.pushState(null, "", `#${item.id}`);
              setActiveId(item.id);
            }
          }}
          className={cn(
            "block py-1.5 text-sm transition-colors hover:text-foreground",
            isActive
              ? "font-medium text-primary"
              : "text-muted-foreground"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {item.text}
        </a>
        {item.children.length > 0 && (
          <ul className="space-y-1">
            {item.children.map((child) => renderTocItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  // 空目录不渲染
  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold">目录</h3>
      <ul className="space-y-1 border-l pl-4">
        {toc.map((item) => renderTocItem(item))}
      </ul>
    </nav>
  );
}
