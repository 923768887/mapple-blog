"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MarkdownEditor,
  CoverUpload,
  TagSelector,
  CategorySelector,
} from "@/components/editor";

/**
 * 新建文章页面
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function NewPostPage() {
  const router = useRouter();

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

  // 保存为草稿
  // Requirements: 5.5 - 保存草稿但不公开显示，状态标记为草稿
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("请输入文章标题");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          summary: summary.trim() || undefined,
          coverUrl: coverUrl || undefined,
          status: "DRAFT",
          categoryId: categoryId || undefined,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "保存失败");
      }

      const post = await response.json();
      toast.success("草稿已保存");
      router.push(`/admin/posts/${post.id}/edit`);
    } catch (error) {
      console.error("保存草稿失败:", error);
      toast.error(error instanceof Error ? error.message : "保存草稿失败");
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
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          summary: summary.trim() || undefined,
          coverUrl: coverUrl || undefined,
          status: "PUBLISHED",
          categoryId: categoryId || undefined,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "发布失败");
      }

      toast.success("文章已发布");
      router.push("/admin/posts");
    } catch (error) {
      console.error("发布文章失败:", error);
      toast.error(error instanceof Error ? error.message : "发布文章失败");
    } finally {
      setPublishing(false);
    }
  };

  const isSubmitting = saving || publishing;

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
            <h1 className="text-2xl font-bold tracking-tight">新建文章</h1>
            <p className="text-muted-foreground">创建一篇新的博客文章</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            保存草稿
          </Button>
          <Button onClick={handlePublish} disabled={isSubmitting}>
            {publishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            发布
          </Button>
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
    </div>
  );
}
