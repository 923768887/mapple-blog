"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/markdown";

interface TableOfContentsProps {
  /** 目录数据 */
  toc: TocItem[];
  /** 自定义类名 */
  className?: string;
}

// 辅助函数：根据 ID 查找 TocItem
function findTocItemById(items: TocItem[], id: string): TocItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children.length > 0) {
      const found = findTocItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 辅助函数：标准化文本用于比较
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

// 辅助函数：获取所有标题 ID（扁平化）
function getAllTocIds(items: TocItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.id);
    if (item.children.length > 0) {
      ids.push(...getAllTocIds(item.children));
    }
  }
  return ids;
}

/**
 * 文章目录导航组件
 * 支持点击跳转、当前位置高亮、滚动和紧凑样式
 * Requirements: 2.3
 */
export function TableOfContents({ toc, className }: TableOfContentsProps) {
  // 当前激活的标题 ID
  const [activeId, setActiveId] = useState<string>("");
  // 用于存储实际找到的标题元素 ID 映射
  const headingMapRef = useRef<Map<string, string>>(new Map());

  // 获取所有标题 ID（扁平化）
  const getAllIds = useCallback((items: TocItem[]): string[] => {
    return getAllTocIds(items);
  }, []);

  // 监听滚动，更新当前激活的标题
  useEffect(() => {
    if (toc.length === 0) return;

    const headingIds = getAllIds(toc);
    
    // 查找页面中所有的标题元素
    const allHeadings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    const headingElements: HTMLElement[] = [];
    const idMap = new Map<string, string>();
    
    // 建立 toc ID 到实际 DOM ID 的映射
    headingIds.forEach((tocId) => {
      // 首先尝试直接匹配
      let element = document.getElementById(tocId);
      
      // 如果没找到，尝试在所有标题中查找文本匹配的
      if (!element) {
        const tocItem = findTocItemById(toc, tocId);
        if (tocItem) {
          for (const heading of allHeadings) {
            const headingText = heading.textContent?.trim() || '';
            if (headingText === tocItem.text || normalizeText(headingText) === normalizeText(tocItem.text)) {
              element = heading as HTMLElement;
              break;
            }
          }
        }
      }
      
      if (element) {
        headingElements.push(element);
        idMap.set(element.id, tocId);
      }
    });
    
    headingMapRef.current = idMap;

    if (headingElements.length === 0) return;

    // 使用滚动事件来确定当前激活的标题
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const headerOffset = 100; // 头部偏移量
      
      let currentActiveId = '';
      
      // 找到当前滚动位置对应的标题
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        const elementTop = element.getBoundingClientRect().top + scrollTop;
        
        if (scrollTop >= elementTop - headerOffset) {
          const domId = element.id;
          currentActiveId = idMap.get(domId) || domId;
          break;
        }
      }
      
      // 如果没有找到，默认选择第一个
      if (!currentActiveId && headingElements.length > 0) {
        const firstId = headingElements[0].id;
        currentActiveId = idMap.get(firstId) || firstId;
      }
      
      setActiveId(currentActiveId);
    };

    // 初始化时执行一次
    handleScroll();
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc, getAllIds]);

  // 滚动到目录中当前激活的项
  useEffect(() => {
    if (!activeId) return;
    const activeElement = document.querySelector(`[data-toc-id="${activeId}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeId]);

  // 点击目录项时滚动到对应标题
  const handleTocClick = (e: React.MouseEvent, item: TocItem) => {
    e.preventDefault();
    
    // 首先尝试直接通过 ID 查找
    let element = document.getElementById(item.id);
    
    // 如果没找到，尝试通过文本内容查找
    if (!element) {
      const allHeadings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      for (const heading of allHeadings) {
        const headingText = heading.textContent?.trim() || '';
        if (headingText === item.text || normalizeText(headingText) === normalizeText(item.text)) {
          element = heading as HTMLElement;
          break;
        }
      }
    }
    
    if (element) {
      // 计算滚动位置，考虑固定头部的高度
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // 更新 URL hash
      window.history.pushState(null, "", `#${element.id}`);
      setActiveId(item.id);
    }
  };

  // 渲染目录项
  const renderTocItem = (item: TocItem, depth: number = 0) => {
    const isActive = activeId === item.id;
    const paddingLeft = 8 + depth * 12;

    return (
      <li key={item.id}>
        {/* 链接容器 - 相对定位用于激活指示器 */}
        <div className="relative">
          {/* 激活指示器 - 只在当前链接旁边显示 */}
          {isActive && (
            <span 
              className="absolute left-0 top-0 h-full w-0.5 bg-primary rounded-full" 
            />
          )}
          <a
            href={`#${item.id}`}
            data-toc-id={item.id}
            onClick={(e) => handleTocClick(e, item)}
            className={cn(
              "block py-1.5 text-[13px] leading-snug transition-all duration-200",
              "hover:text-foreground truncate",
              isActive
                ? "font-medium text-primary bg-primary/10 rounded-r"
                : "text-muted-foreground hover:bg-muted/50 rounded-r"
            )}
            style={{ paddingLeft: `${paddingLeft}px`, paddingRight: "8px" }}
            title={item.text}
          >
            {item.text}
          </a>
        </div>
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
