"use client";

import { useState, useCallback, useEffect } from "react";
import { Eye, Edit3, Columns } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/posts/markdown-renderer";

interface MarkdownEditorProps {
  /** Markdown 内容 */
  value: string;
  /** 内容变更回调 */
  onChange: (value: string) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 最小高度 */
  minHeight?: string;
}

/**
 * Markdown 编辑器组件
 * 支持编辑、预览和分栏模式
 * Requirements: 5.1 - 实时渲染预览，显示格式化后的效果
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "在此输入 Markdown 内容...",
  className,
  minHeight = "500px",
}: MarkdownEditorProps) {
  // 当前视图模式：edit（编辑）、preview（预览）、split（分栏）
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  // 预览 HTML 内容
  const [previewHtml, setPreviewHtml] = useState<string>("");
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 解析 Markdown 为 HTML
  const parseMarkdown = useCallback(async (markdown: string) => {
    if (!markdown.trim()) {
      setPreviewHtml("");
      return;
    }

    setIsLoading(true);
    try {
      // 动态导入 markdown 解析函数，避免服务端渲染问题
      const { parseMarkdownToHtml } = await import("@/lib/markdown");
      const html = await parseMarkdownToHtml(markdown);
      setPreviewHtml(html);
    } catch (error) {
      console.error("Markdown 解析失败:", error);
      setPreviewHtml("<p class='text-destructive'>Markdown 解析失败</p>");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 防抖解析 Markdown
  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewMode !== "edit") {
        parseMarkdown(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, viewMode, parseMarkdown]);

  // 处理内容变更
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden", className)}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <span className="text-sm font-medium text-muted-foreground">Markdown 编辑器</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={viewMode === "edit" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("edit")}
            title="编辑模式"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "split" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
            title="分栏模式"
          >
            <Columns className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            title="预览模式"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div
        className="flex flex-1"
        style={{ minHeight }}
      >
        {/* 编辑面板 */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className={cn(
            "flex-1 flex flex-col",
            viewMode === "split" && "border-r"
          )}>
            <Textarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* 预览面板 */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={cn(
            "flex-1 overflow-auto p-4 bg-background",
            viewMode === "split" && "max-w-[50%]"
          )}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <span>加载中...</span>
              </div>
            ) : previewHtml ? (
              <MarkdownRenderer html={previewHtml} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <span>预览区域</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
