import { Skeleton } from "@/components/ui/skeleton";

/**
 * 文章详情页加载状态
 * 在数据加载期间显示骨架屏，提升用户体验
 */
export default function PostLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr,240px]">
        {/* 主内容区骨架 */}
        <main className="min-w-0 space-y-6">
          {/* 分类 */}
          <Skeleton className="h-4 w-20" />
          
          {/* 标题 */}
          <Skeleton className="h-10 w-3/4" />
          
          {/* 元信息 */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* 标签 */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          
          {/* 封面图 */}
          <Skeleton className="aspect-video w-full rounded-lg" />
          
          {/* 正文内容 */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* 更多段落 */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </main>

        {/* 侧边栏骨架 - 目录 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <Skeleton className="h-5 w-16" />
            <div className="space-y-2 pl-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28 ml-4" />
              <Skeleton className="h-4 w-24 ml-4" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-30 ml-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
