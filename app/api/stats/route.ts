import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// 统计数据响应类型
export interface StatsResponse {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  recentPosts: {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    createdAt: string;
    views: number;
  }[];
}

// GET /api/stats - 获取仪表盘统计数据
export async function GET() {
  try {
    // 验证用户认证
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 并行查询统计数据
    const [totalPosts, draftPosts, publishedPosts, recentPosts] = await Promise.all([
      // 文章总数
      prisma.post.count(),
      // 草稿数
      prisma.post.count({
        where: { status: "DRAFT" },
      }),
      // 已发布数
      prisma.post.count({
        where: { status: "PUBLISHED" },
      }),
      // 最近发布的 5 篇文章（按发布时间降序）
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          views: true,
        },
      }),
    ]);

    const response: StatsResponse = {
      totalPosts,
      draftPosts,
      publishedPosts,
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        views: post.views,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
