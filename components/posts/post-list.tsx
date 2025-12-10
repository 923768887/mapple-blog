"use client";

import { PostCard, PostCardData } from "./post-card";
import { Pagination } from "./pagination";

interface PostListProps {
  posts: PostCardData[];
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

/**
 * 文章列表组件
 * 显示文章卡片列表和分页控件
 */
export function PostList({
  posts,
  currentPage,
  totalPages,
  basePath = "/",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">📝</div>
        <h3 className="mb-2 text-lg font-medium">暂无文章</h3>
        <p className="text-sm text-muted-foreground">
          还没有发布任何文章，敬请期待！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 文章卡片网格 */}
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* 分页 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
    </div>
  );
}
