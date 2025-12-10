import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 文章详情响应类型
export interface GetPostDetailResponse {
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
  author: {
    id: string;
    name: string | null;
    email: string;
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    // 根据 slug 查询文章详情，包含关联数据
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // 文章不存在
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 仅已发布文章可公开访问
    if (post.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 增加阅读计数
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    // 构建响应数据，扁平化标签结构
    const response: GetPostDetailResponse = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary,
      coverUrl: post.coverUrl,
      status: post.status,
      views: post.views + 1, // 返回更新后的阅读数
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      category: post.category,
      tags: post.tags.map((pt) => pt.tag),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching post detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch post detail" },
      { status: 500 }
    );
  }
}
