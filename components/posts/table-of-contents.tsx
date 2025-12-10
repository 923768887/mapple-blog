"use client";

import { useEffect, useState, useCallback } from "react";
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
 * 支持点击跳转、当前位置高亮、滚动和紧凑样式
 * Requirements: 2.3
 */
export function TableOfContents({ toc, className }: TableOfContentsProps) {
  // 当前激活的标题 ID
  const [activeId, setActiveId] = useState<string>("");

  // 获取所有标题 ID（扁平化）
  const getAllIds = useCallback((items: TocItem[]): string[] => {
    const ids: string[] = [];
    for (const item of items) {
      ids.push(item.id);
      if (item.children.length > 0) {
        ids.push(...getAllIds(item.children));
      }
    }
    return ids;
  }, []);

  // 监听滚动，更新当前激活的标题
  useEffect(() => {
    if (toc.length === 0) return;

    const headingIds = getAllIds(toc);
    const headingElements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // 使用 IntersectionObserver 监听标题可见性
    const observer = new IntersectionObserver(
      (entries) => {
        // 找到所有可见的标题
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // 选择最靠近顶部的可见标题
          const topEntry = visibleEntries.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top
              ? prev
              : curr;
          });
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc, getAllIds]);

  // 滚动到目录中当前激活的项
  useEffect(() => {
    if (!activeId) return;
    const activeElement = document.querySelector(`[data-toc-id="${activeId}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeId]);

  // 渲染目录项
  const renderTocItem = (item: TocItem, depth: number = 0) => {
    const isActive = activeId === item.id;
    const paddingLeft = 8 + depth * 12;

    return (
      <li key={item.id} className="relative">
        {/* 激活指示器 */}
        {isActive && (
          <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full" />
        )}
        <a
          href={`#${item.id}`}
          data-toc-id={item.id}
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
            "block py-1 text-[13px] leading-snug transition-all duration-200",
            "hover:text-foreground truncate",
            isActive
              ? "font-medium text-primary bg-primary/5 rounded-r"
              : "text-muted-foreground hover:bg-muted/50 rounded-r"
          )}
          style={{ paddingLeft: `${paddingLeft}px`, paddingRight: "8px" }}
          title={item.text}
        >
          {item.text}
        </a>
        {item.children.length > 0 && (
          <ul className="space-y-0.5">
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
    <nav className={cn("flex flex-col", className)}>
      {/* 标题 */}
      <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        <h3 className="text-sm font-semibold text-foreground">目录</h3>
        <span className="text-xs text-muted-foreground">
          ({getAllIds(toc).length})
        </span>
      </div>
      
      {/* 目录列表 - 可滚动 */}
      <div className="relative flex-1 min-h-0">
        <ul
          className={cn(
            "space-y-0.5 border-l border-border/50",
            "max-h-[calc(100vh-200px)] overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
            "hover:scrollbar-thumb-muted-foreground/50"
          )}
        >
          {toc.map((item) => renderTocItem(item))}
        </ul>
        
        {/* 渐变遮罩 - 提示可滚动 */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </nav>
  );
}
