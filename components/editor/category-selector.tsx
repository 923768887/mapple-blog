"use client";

import { useState, useEffect } from "react";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// 分类类型
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySelectorProps {
  /** 已选择的分类 ID */
  value: string | null;
  /** 选择变更回调 */
  onChange: (categoryId: string | null) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 分类选择器组件
 * 支持单选分类和创建新分类
 * Requirements: 5.2 - 保存文章时包括分类
 */
export function CategorySelector({
  value,
  onChange,
  className,
}: CategorySelectorProps) {
  // 所有可用分类
  const [categories, setCategories] = useState<Category[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 下拉框展开状态
  const [open, setOpen] = useState(false);
  // 搜索关键词
  const [search, setSearch] = useState("");
  // 新建分类对话框
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("获取分类列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 当前选中的分类
  const selectedCategory = categories.find((cat) => cat.id === value);

  // 过滤后的分类列表
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // 选择分类
  const selectCategory = (categoryId: string | null) => {
    onChange(categoryId);
    setOpen(false);
  };

  // 创建新分类
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        onChange(newCategory.id);
        setNewCategoryName("");
        setCreateDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.details?.name || "创建分类失败");
      }
    } catch (error) {
      console.error("创建分类失败:", error);
      alert("创建分类失败");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>分类</Label>

      {/* 分类选择下拉框 */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen(!open)}
        >
          <span className={selectedCategory ? "" : "text-muted-foreground"}>
            {loading
              ? "加载中..."
              : selectedCategory
              ? selectedCategory.name
              : "选择分类..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            {/* 搜索框 */}
            <div className="p-2 border-b">
              <Input
                placeholder="搜索分类..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
            </div>

            {/* 分类列表 */}
            <div className="max-h-48 overflow-auto p-1">
              {/* 无分类选项 */}
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  !value && "bg-accent"
                )}
                onClick={() => selectCategory(null)}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-muted-foreground">无分类</span>
              </button>

              {filteredCategories.length === 0 && search ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  未找到匹配的分类
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                      "hover:bg-accent hover:text-accent-foreground",
                      value === category.id && "bg-accent"
                    )}
                    onClick={() => selectCategory(category.id)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                  </button>
                ))
              )}
            </div>

            {/* 创建新分类按钮 */}
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
                创建新分类
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

      {/* 创建分类对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新分类</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="输入分类名称..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateCategory();
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
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || creating}
            >
              {creating ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
