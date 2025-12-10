"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoverUploadProps {
  /** 当前封面 URL */
  value: string;
  /** URL 变更回调 */
  onChange: (url: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 封面上传组件
 * 支持 URL 输入和图片预览
 * Requirements: 5.3 - 上传封面图片并关联到文章记录
 */
export function CoverUpload({
  value,
  onChange,
  className,
}: CoverUploadProps) {
  const [inputMode, setInputMode] = useState<"url" | "preview">(value ? "preview" : "url");
  const [urlInput, setUrlInput] = useState(value);
  const [imageError, setImageError] = useState(false);

  // 处理 URL 输入确认
  const handleUrlConfirm = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setInputMode("preview");
      setImageError(false);
    }
  };

  // 处理清除封面
  const handleClear = () => {
    onChange("");
    setUrlInput("");
    setInputMode("url");
    setImageError(false);
  };

  // 处理图片加载错误
  const handleImageError = () => {
    setImageError(true);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUrlConfirm();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>封面图片</Label>
      
      {inputMode === "url" || !value ? (
        // URL 输入模式
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入图片 URL..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleUrlConfirm}
              disabled={!urlInput.trim()}
            >
              确认
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            支持 jpg、png、gif、webp 格式的图片链接
          </p>
        </div>
      ) : (
        // 预览模式
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
            {imageError ? (
              // 图片加载失败
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm">图片加载失败</span>
              </div>
            ) : (
              // 图片预览
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="封面预览"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setInputMode("url");
                setUrlInput(value);
              }}
              title="更换图片"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleClear}
              title="移除封面"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
