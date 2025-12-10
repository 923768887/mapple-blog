import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export interface GetPostsResponse {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    coverUrl: string | null;
    status: "DRAFT" | "PUBLISHED";
    views: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
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
  page: number;
  pageSize: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析分页参数
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    
    // 解析筛选参数
    const tagSlug = searchParams.get("tagSlug");
    const categorySlug = searchParams.get("categorySlug");
    
    // 构建查询条件 - 仅返回已发布文章
    const where: {
      status: "PUBLISHED";
      tags?: { some: { tag: { slug: string } } };
      category?: { slug: string };
    } = {
      status: "PUBLISHED",
    };

    // 按标签筛选
    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      };
    }
    
    // 按分类筛选
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }
    
    // 获取总数用于分页
    const total = await prisma.post.count({ where });
    
    // 获取文章列表，按发布日期降序排序
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
    
    // 转换响应数据，扁平化标签结构
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      coverUrl: post.coverUrl,
      status: post.status,
      views: post.views,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      category: post.category,
      tags: post.tags.map((pt) => pt.tag),
    }));
    
    const response: GetPostsResponse = {
      posts: transformedPosts,
      total,
      page,
      pageSize,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
