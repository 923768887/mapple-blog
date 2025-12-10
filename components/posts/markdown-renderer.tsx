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
 * 优化排版、间距和视觉效果，提升阅读体验
 * Requirements: 2.2, 11.3
 */
export function MarkdownRenderer({ html, className }: MarkdownRendererProps) {
  return (
    <article
      className={cn(
        // 基础排版样式
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-lg", // 更大的基础字号
        
        // 段落样式 - 更舒适的行高和间距
        "prose-p:leading-relaxed prose-p:text-foreground/90",
        "prose-p:my-4",
        
        // 标题样式 - 更清晰的层级
        "prose-headings:scroll-mt-24 prose-headings:font-bold",
        "prose-headings:text-foreground prose-headings:tracking-tight",
        "prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4",
        "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2",
        "prose-h2:border-b prose-h2:border-border/60",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2",
        
        // 链接样式 - 更明显的交互反馈
        "prose-a:text-primary prose-a:font-medium",
        "prose-a:underline prose-a:underline-offset-2 prose-a:decoration-primary/30",
        "hover:prose-a:decoration-primary prose-a:transition-colors",
        
        // 代码块样式 - 更美观的代码展示
        "prose-pre:rounded-lg prose-pre:border prose-pre:border-border/50",
        "prose-pre:shadow-sm prose-pre:my-6",
        "prose-code:text-sm prose-code:font-medium",
        "prose-code:before:content-none prose-code:after:content-none",
        
        // 行内代码样式
        "prose-code:bg-muted prose-code:text-foreground",
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md",
        "prose-code:border prose-code:border-border/50",
        
        // 引用样式 - 更优雅的引用块
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/50",
        "prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg",
        "prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-6",
        "prose-blockquote:not-italic prose-blockquote:text-foreground/80",
        
        // 图片样式 - 更好的图片展示
        "prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8",
        "prose-img:border prose-img:border-border/30",
        
        // 列表样式 - 更清晰的列表
        "prose-ul:my-4 prose-ol:my-4",
        "prose-li:my-1 prose-li:leading-relaxed",
        "prose-li:marker:text-primary/60",
        
        // 表格样式 - 更美观的表格
        "prose-table:w-full prose-table:my-6",
        "prose-table:border-collapse prose-table:rounded-lg prose-table:overflow-hidden",
        "prose-table:border prose-table:border-border/50",
        "prose-thead:bg-muted/70",
        "prose-th:border prose-th:border-border/50",
        "prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold",
        "prose-th:text-foreground",
        "prose-td:border prose-td:border-border/50",
        "prose-td:px-4 prose-td:py-3",
        "prose-tr:transition-colors hover:prose-tr:bg-muted/30",
        
        // 分割线样式
        "prose-hr:my-8 prose-hr:border-border/50",
        
        // 强调样式
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-em:text-foreground/90",
        
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
