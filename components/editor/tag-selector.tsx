"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// 标签类型
interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagSelectorProps {
  /** 已选择的标签 ID 列表 */
  value: string[];
  /** 选择变更回调 */
  onChange: (tagIds: string[]) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 标签选择器组件
 * 支持多选标签和创建新标签
 * Requirements: 5.2 - 保存文章时包括标签
 */
export function TagSelector({
  value,
  onChange,
  className,
}: TagSelectorProps) {
  // 所有可用标签
  const [tags, setTags] = useState<Tag[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 下拉框展开状态
  const [open, setOpen] = useState(false);
  // 搜索关键词
  const [search, setSearch] = useState("");
  // 新建标签对话框
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);

  // 获取标签列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags || []);
        }
      } catch (error) {
        console.error("获取标签列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // 已选择的标签对象
  const selectedTags = tags.filter((tag) => value.includes(tag.id));

  // 过滤后的标签列表
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  // 切换标签选择
  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  // 移除标签
  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  // 创建新标签
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        onChange([...value, newTag.id]);
        setNewTagName("");
        setCreateDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.details?.name || "创建标签失败");
      }
    } catch (error) {
      console.error("创建标签失败:", error);
      alert("创建标签失败");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>标签</Label>

      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1">
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 标签选择下拉框 */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen(!open)}
        >
          <span className="text-muted-foreground">
            {loading ? "加载中..." : "选择标签..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            {/* 搜索框 */}
            <div className="p-2 border-b">
              <Input
                placeholder="搜索标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
            </div>

            {/* 标签列表 */}
            <div className="max-h-48 overflow-auto p-1">
              {filteredTags.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {search ? "未找到匹配的标签" : "暂无标签"}
                </div>
              ) : (
                filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                      "hover:bg-accent hover:text-accent-foreground",
                      value.includes(tag.id) && "bg-accent"
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value.includes(tag.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag.name}
                  </button>
                ))
              )}
            </div>

            {/* 创建新标签按钮 */}
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                创建新标签
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 点击外部关闭下拉框 */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 创建标签对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新标签</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="输入标签名称..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || creating}
            >
              {creating ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
