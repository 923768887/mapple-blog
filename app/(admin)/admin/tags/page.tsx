"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit, MoreHorizontal, Tags, Search } from "lucide-react";
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

// 标签类型定义
interface Tag {
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

// 标签管理页面组件
export default function AdminTagsPage() {
  // 状态管理
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // 表单状态
  const [formName, setFormName] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("获取标签列表失败");
      }
      const data = await response.json();
      setTags(data.tags);
    } catch (error) {
      console.error("获取标签列表失败:", error);
      toast.error("获取标签列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化获取数据
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // 筛选标签
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // 创建标签
  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("标签名称不能为空");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details?.name || "创建标签失败");
      }

      toast.success("标签创建成功");
      setCreateDialogOpen(false);
      setFormName("");
      fetchTags();
    } catch (error) {
      console.error("创建标签失败:", error);
      toast.error(error instanceof Error ? error.message : "创建标签失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 更新标签
  const handleUpdate = async () => {
    if (!tagToEdit || !formName.trim()) {
      toast.error("标签名称不能为空");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`/api/tags/${tagToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details?.name || "更新标签失败");
      }

      toast.success("标签更新成功");
      setEditDialogOpen(false);
      setTagToEdit(null);
      setFormName("");
      fetchTags();
    } catch (error) {
      console.error("更新标签失败:", error);
      toast.error(error instanceof Error ? error.message : "更新标签失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 删除标签
  const handleDelete = async () => {
    if (!tagToDelete) return;

    try {
      const response = await fetch(`/api/tags/${tagToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除标签失败");
      }

      toast.success("标签删除成功");
      setDeleteDialogOpen(false);
      setTagToDelete(null);
      fetchTags();
    } catch (error) {
      console.error("删除标签失败:", error);
      toast.error("删除标签失败");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (tag: Tag) => {
    setTagToEdit(tag);
    setFormName(tag.name);
    setEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签管理</h1>
          <p className="text-muted-foreground">管理博客文章的标签</p>
        </div>
        <Button onClick={() => { setFormName(""); setCreateDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          新建标签
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标签..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <Badge variant="secondary">{filteredTags.length} 个标签</Badge>
      </div>

      {/* 标签列表表格 */}
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
            ) : filteredTags.length === 0 ? (
              // 空状态
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Tags className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchInput ? "没有找到匹配的标签" : "暂无标签"}
                    </p>
                    {!searchInput && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setFormName(""); setCreateDialogOpen(true); }}
                      >
                        创建第一个标签
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // 标签列表
              filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{tag.name}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {tag.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tag.postCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(tag.createdAt)}
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
                        <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(tag)}
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

      {/* 创建标签对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建标签</DialogTitle>
            <DialogDescription>
              创建一个新的标签用于文章分类。标签名称必须唯一。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">标签名称</Label>
              <Input
                id="name"
                placeholder="输入标签名称"
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

      {/* 编辑标签对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
            <DialogDescription>
              修改标签名称。标签名称必须唯一。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">标签名称</Label>
              <Input
                id="edit-name"
                placeholder="输入标签名称"
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
              确定要删除标签 &quot;{tagToDelete?.name}&quot; 吗？
              {tagToDelete?.postCount && tagToDelete.postCount > 0 && (
                <span className="block mt-2 text-amber-600">
                  该标签关联了 {tagToDelete.postCount} 篇文章，删除后这些文章将不再包含此标签。
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
