"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit, MoreHorizontal, FolderOpen, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// 分类类型定义
interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  postCount?: number;
}

// 格式化日期
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

// 分类管理页面组件
export default function AdminCategoriesPage() {
  // 状态管理
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // 表单状态
  const [formName, setFormName] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("获取分类列表失败");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("获取分类列表失败:", error);
      toast.error("获取分类列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化获取数据
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 筛选分类
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // 创建分类
  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("分类名称不能为空");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details?.name || "创建分类失败");
      }

      toast.success("分类创建成功");
      setCreateDialogOpen(false);
      setFormName("");
      fetchCategories();
    } catch (error) {
      console.error("创建分类失败:", error);
      toast.error(error instanceof Error ? error.message : "创建分类失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 更新分类
  const handleUpdate = async () => {
    if (!categoryToEdit || !formName.trim()) {
      toast.error("分类名称不能为空");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`/api/categories/${categoryToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details?.name || "更新分类失败");
      }

      toast.success("分类更新成功");
      setEditDialogOpen(false);
      setCategoryToEdit(null);
      setFormName("");
      fetchCategories();
    } catch (error) {
      console.error("更新分类失败:", error);
      toast.error(error instanceof Error ? error.message : "更新分类失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 删除分类
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除分类失败");
      }

      toast.success("分类删除成功");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error("删除分类失败:", error);
      toast.error("删除分类失败");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setFormName(category.name);
    setEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分类管理</h1>
          <p className="text-muted-foreground">管理博客文章的分类</p>
        </div>
        <Button onClick={() => { setFormName(""); setCreateDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          新建分类
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索分类..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <Badge variant="secondary">{filteredCategories.length} 个分类</Badge>
      </div>

      {/* 分类列表表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead className="w-[120px]">Slug</TableHead>
              <TableHead className="w-[100px]">文章数</TableHead>
              <TableHead className="w-[120px]">创建时间</TableHead>
              <TableHead className="w-[80px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <div className="h-10 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCategories.length === 0 ? (
              // 空状态
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchInput ? "没有找到匹配的分类" : "暂无分类"}
                    </p>
                    {!searchInput && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setFormName(""); setCreateDialogOpen(true); }}
                      >
                        创建第一个分类
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // 分类列表
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.postCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">操作菜单</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 创建分类对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建分类</DialogTitle>
            <DialogDescription>
              创建一个新的分类用于组织文章。分类名称必须唯一。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">分类名称</Label>
              <Input
                id="name"
                placeholder="输入分类名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑分类对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>
              修改分类名称。分类名称必须唯一。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">分类名称</Label>
              <Input
                id="edit-name"
                placeholder="输入分类名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
              {formLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除分类 &quot;{categoryToDelete?.name}&quot; 吗？
              {categoryToDelete?.postCount && categoryToDelete.postCount > 0 && (
                <span className="block mt-2 text-amber-600">
                  该分类关联了 {categoryToDelete.postCount} 篇文章，删除后这些文章的分类将被清空。
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
