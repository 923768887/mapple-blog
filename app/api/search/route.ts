import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 搜索响应接口
export interface SearchResponse {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    coverUrl: string | null;
    views: number;
    publishedAt: string | null;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
  total: number;
  query: string;
}

// 验证搜索关键词是否有效（非空且不仅包含空白字符）
function isValidSearchQuery(query: string | null): query is string {
  if (!query) return false;
  return query.trim().length > 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // 验证搜索关键词 - 空白关键词拒绝
    if (!isValidSearchQuery(query)) {
      return NextResponse.json(
        { error: "搜索关键词不能为空或仅包含空白字符" },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    // 在标题、摘要、正文中进行模糊搜索，仅搜索已发布文章
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: trimmedQuery, mode: "insensitive" } },
          { summary: { contains: trimmedQuery, mode: "insensitive" } },
          { content: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      },
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // 转换响应数据，扁平化标签结构
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      coverUrl: post.coverUrl,
      views: post.views,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      category: post.category,
      tags: post.tags.map((pt) => pt.tag),
    }));

    const response: SearchResponse = {
      posts: transformedPosts,
      total: transformedPosts.length,
      query: trimmedQuery,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("搜索文章时出错:", error);
    return NextResponse.json(
      { error: "搜索失败" },
      { status: 500 }
    );
  }
}
