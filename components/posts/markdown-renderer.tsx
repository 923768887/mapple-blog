"use client";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  /** HTML 内容（已从 Markdown 转换） */
  html: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * Markdown 渲染组件
 * 将解析后的 HTML 内容渲染为格式化的文章正文
 * Requirements: 2.2, 11.3
 */
export function MarkdownRenderer({ html, className }: MarkdownRendererProps) {
  return (
    <article
      className={cn(
        // 基础排版样式
        "prose prose-neutral dark:prose-invert max-w-none",
        // 标题样式
        "prose-headings:scroll-mt-20 prose-headings:font-semibold",
        "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
        "prose-h2:border-b prose-h2:pb-2 prose-h2:border-border",
        // 链接样式
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // 代码块样式
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
        "prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
        // 引用样式
        "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50",
        "prose-blockquote:py-1 prose-blockquote:not-italic",
        // 图片样式
        "prose-img:rounded-lg prose-img:shadow-md",
        // 列表样式
        "prose-li:marker:text-muted-foreground",
        // 表格样式
        "prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border",
        "prose-thead:bg-muted",
        "prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold",
        "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2",
        "prose-tr:even:bg-muted/30",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
