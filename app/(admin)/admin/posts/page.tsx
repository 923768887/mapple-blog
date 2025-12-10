"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// 文章类型定义
interface Post {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Array<{ id: string; name: string; slug: string }>;
}


// API 响应类型
interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
}

// 格式化日期
function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

// 文章管理页面组件
export default function AdminPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态管理
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [batchPublishDialogOpen, setBatchPublishDialogOpen] = useState(false);

  // 从 URL 参数获取筛选条件
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";

  // 搜索输入状态（用于防抖）
  const [searchInput, setSearchInput] = useState(search);

  // 获取文章列表
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());
      if (status !== "all") {
        params.set("status", status);
      }
      if (search) {
        params.set("search", search);
      }

      const response = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("获取文章列表失败");
      }

      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setTotal(data.total);
    } catch (error) {
      console.error("获取文章列表失败:", error);
      toast.error("获取文章列表失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search]);

  // 初始化和参数变化时获取数据
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput, page: "1" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 更新 URL 参数
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/posts?${params.toString()}`);
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 单选
  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // 删除单篇文章
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("删除失败");
      }
      toast.success("文章已删除");
      setPostToDelete(null);
      setDeleteDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("删除文章失败:", error);
      toast.error("删除文章失败");
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      toast.success(`已删除 ${selectedIds.size} 篇文章`);
      setSelectedIds(new Set());
      setBatchDeleteDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("批量删除失败:", error);
      toast.error("批量删除失败");
    }
  };

  // 批量发布
  const handleBatchPublish = async () => {
    try {
      const publishPromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/admin/posts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" }),
        })
      );
      await Promise.all(publishPromises);
      toast.success(`已发布 ${selectedIds.size} 篇文章`);
      setSelectedIds(new Set());
      setBatchPublishDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("批量发布失败:", error);
      toast.error("批量发布失败");
    }
  };

  // 计算分页信息
  const totalPages = Math.ceil(total / pageSize);
  const isAllSelected = posts.length > 0 && selectedIds.size === posts.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < posts.length;


  return (
    <>
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文章管理</h1>
          <p className="text-muted-foreground">管理您的博客文章</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Link>
        </Button>
      </div>

      {/* 筛选和搜索栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文章标题..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => updateParams({ status: value === "all" ? "" : value, page: "1" })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="PUBLISHED">已发布</SelectItem>
              <SelectItem value="DRAFT">草稿</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 批量操作按钮 */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedIds.size} 项
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBatchPublishDialogOpen(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              批量发布
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBatchDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              批量删除
            </Button>
          </div>
        )}
      </div>

      {/* 文章列表表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={handleSelectAll}
                  aria-label="全选"
                />
              </TableHead>
              <TableHead>标题</TableHead>
              <TableHead className="w-[100px]">状态</TableHead>
              <TableHead className="w-[80px]">阅读量</TableHead>
              <TableHead className="w-[160px]">更新时间</TableHead>
              <TableHead className="w-[80px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-10 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : posts.length === 0 ? (
              // 空状态
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">暂无文章</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/posts/new">创建第一篇文章</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // 文章列表
              posts.map((post) => (
                <TableRow key={post.id} data-state={selectedIds.has(post.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(post.id)}
                      onCheckedChange={(checked) => handleSelectOne(post.id, checked)}
                      aria-label={`选择 ${post.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-medium hover:underline line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                      {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.views}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(post.updatedAt)}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/posts/${post.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            查看
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setPostToDelete(post.id);
                            setDeleteDialogOpen(true);
                          }}
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


      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共 {total} 篇文章，第 {page} / {totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: (page - 1).toString() })}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: (page + 1).toString() })}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这篇文章吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => postToDelete && handleDelete(postToDelete)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              确定要删除选中的 {selectedIds.size} 篇文章吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量发布确认对话框 */}
      <Dialog open={batchPublishDialogOpen} onOpenChange={setBatchPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量发布</DialogTitle>
            <DialogDescription>
              确定要发布选中的 {selectedIds.size} 篇文章吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchPublishDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBatchPublish}>
              发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
