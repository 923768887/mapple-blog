import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * 获取已发布的文章列表（公开 API，支持分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(20, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    const tagSlug = searchParams.get("tagSlug") || undefined;
    const categorySlug = searchParams.get("categorySlug") || undefined;

    // 构建查询条件
    const where: {
      status: "PUBLISHED";
      tags?: { some: { tag: { slug: string } } };
      category?: { slug: string };
    } = {
      status: "PUBLISHED",
    };

    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      };
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    // 获取总数
    const total = await prisma.post.count({ where });

    // 获取文章列表
    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        publishedAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
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

    // 转换数据格式
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      coverUrl: post.coverUrl,
      views: post.views,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      author: post.author,
      category: post.category,
      tags: post.tags.map((pt) => pt.tag),
    }));

    const totalPages = Math.ceil(total / pageSize);
    const hasMore = page < totalPages;

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("获取文章列表失败:", error);
    return NextResponse.json(
      { error: "获取文章列表失败" },
      { status: 500 }
    );
  }
}
