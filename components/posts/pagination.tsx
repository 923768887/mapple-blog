"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

/**
 * 分页组件
 * 支持上一页、下一页和页码导航
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath = "/",
}: PaginationProps) {
  const searchParams = useSearchParams();

  // 构建带分页参数的 URL
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // 生成页码数组，显示当前页前后各 2 页
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showPages = 5; // 最多显示的页码数
    const halfShow = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, currentPage + halfShow);

    // 调整起始和结束位置
    if (currentPage - halfShow < 1) {
      end = Math.min(totalPages, end + (halfShow - currentPage + 1));
    }
    if (currentPage + halfShow > totalPages) {
      start = Math.max(1, start - (currentPage + halfShow - totalPages));
    }

    // 添加第一页
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis");
      }
    }

    // 添加中间页码
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // 添加最后一页
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="分页导航"
    >
      {/* 上一页 */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={buildPageUrl(currentPage - 1)}>上一页</Link>
        ) : (
          <span>上一页</span>
        )}
      </Button>

      {/* 页码 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={cn("min-w-9", page === currentPage && "pointer-events-none")}
              asChild={page !== currentPage}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={buildPageUrl(page)}>{page}</Link>
              )}
            </Button>
          )
        )}
      </div>

      {/* 下一页 */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildPageUrl(currentPage + 1)}>下一页</Link>
        ) : (
          <span>下一页</span>
        )}
      </Button>
    </nav>
  );
}
