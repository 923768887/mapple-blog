"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Eye,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MarkdownEditor,
  CoverUpload,
  TagSelector,
  CategorySelector,
} from "@/components/editor";

// 文章类型
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  tags: Array<{ id: string; name: string; slug: string }>;
}

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 编辑文章页面
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // 文章数据
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 表单状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // 提交状态
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

  // 删除对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 获取文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("文章不存在");
          }
          if (response.status === 403) {
            throw new Error("您没有权限编辑此文章");
          }
          throw new Error("获取文章失败");
        }

        const data: Post = await response.json();
        setPost(data);

        // 初始化表单
        setTitle(data.title);
        setContent(data.content);
        setSummary(data.summary || "");
        setCoverUrl(data.coverUrl || "");
        setTagIds(data.tags.map((t) => t.id));
        setCategoryId(data.categoryId);
      } catch (err) {
        console.error("获取文章失败:", err);
        setError(err instanceof Error ? err.message : "获取文章失败");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // 保存文章（保持当前状态）
  // Requirements: 5.6 - 编辑已发布文章时保留原发布时间
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("请输入文章标题");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          summary: summary.trim() || null,
          coverUrl: coverUrl || null,
          categoryId: categoryId,
          tagIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "保存失败");
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      toast.success("保存成功");
    } catch (error) {
      console.error("保存文章失败:", error);
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 发布文章
  // Requirements: 5.4 - 切换文章状态为发布，设为公开可见，记录发布时间
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("请输入文章标题");
      return;
    }

    if (!content.trim()) {
      toast.error("请输入文章内容");
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          summary: summary.trim() || null,
          coverUrl: coverUrl || null,
          status: "PUBLISHED",
          categoryId: categoryId,
          tagIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "发布失败");
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      toast.success("文章已发布");
    } catch (error) {
      console.error("发布文章失败:", error);
      toast.error(error instanceof Error ? error.message : "发布失败");
    } finally {
      setPublishing(false);
    }
  };

  // 取消发布（转为草稿）
  // Requirements: 5.5 - 保存草稿但不公开显示，状态标记为草稿
  const handleUnpublish = async () => {
    setUnpublishing(true);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DRAFT",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "操作失败");
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      toast.success("已转为草稿");
    } catch (error) {
      console.error("取消发布失败:", error);
      toast.error(error instanceof Error ? error.message : "操作失败");
    } finally {
      setUnpublishing(false);
    }
  };

  // 删除文章
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      toast.success("文章已删除");
      router.push("/admin/posts");
    } catch (error) {
      console.error("删除文章失败:", error);
      toast.error("删除文章失败");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const isSubmitting = saving || publishing || unpublishing;

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 错误状态
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{error || "文章不存在"}</p>
        <Button asChild>
          <Link href="/admin/posts">返回文章列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/posts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">编辑文章</h1>
              <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                {post.status === "PUBLISHED" ? "已发布" : "草稿"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {post.status === "PUBLISHED" && post.publishedAt
                ? `发布于 ${new Date(post.publishedAt).toLocaleDateString("zh-CN")}`
                : "尚未发布"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 查看按钮（仅已发布文章） */}
          {post.status === "PUBLISHED" && (
            <Button variant="outline" size="icon" asChild>
              <Link href={`/posts/${post.slug}`} target="_blank">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* 删除按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>

          {/* 保存按钮 */}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            保存
          </Button>

          {/* 发布/取消发布按钮 */}
          {post.status === "PUBLISHED" ? (
            <Button
              variant="secondary"
              onClick={handleUnpublish}
              disabled={isSubmitting}
            >
              {unpublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              转为草稿
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              {publishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              发布
            </Button>
          )}
        </div>
      </div>

      {/* 编辑表单 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* 主编辑区 */}
        <div className="space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题..."
              className="text-lg"
            />
          </div>

          {/* Markdown 编辑器 */}
          {/* Requirements: 5.1 - 实时渲染预览，显示格式化后的效果 */}
          <div className="space-y-2">
            <Label>内容</Label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="在此输入 Markdown 内容..."
              minHeight="500px"
            />
          </div>
        </div>

        {/* 侧边栏设置 */}
        <div className="space-y-6">
          {/* 文章信息 */}
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">阅读量</span>
              <span>{post.views}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">创建时间</span>
              <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">更新时间</span>
              <span>{new Date(post.updatedAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </div>

          {/* 摘要 */}
          <div className="space-y-2">
            <Label htmlFor="summary">摘要</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="输入文章摘要（可选）..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              摘要将显示在文章列表中，留空则自动截取正文
            </p>
          </div>

          {/* 封面图片 */}
          {/* Requirements: 5.3 - 上传封面图片并关联到文章记录 */}
          <CoverUpload value={coverUrl} onChange={setCoverUrl} />

          {/* 分类选择 */}
          <CategorySelector value={categoryId} onChange={setCategoryId} />

          {/* 标签选择 */}
          <TagSelector value={tagIds} onChange={setTagIds} />
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除文章「{post.title}」吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
