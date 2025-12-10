import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// 创建文章请求体类型
export interface CreatePostRequest {
  title: string;
  content: string;
  summary?: string;
  coverUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
  categoryId?: string;
  tagIds?: string[];
}

// 文章响应类型
export interface PostResponse {
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
  authorId: string;
  categoryId: string | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

/**
 * GET /api/admin/posts - 获取文章列表（后台管理用，包含草稿）
 * 需要认证
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 解析分页参数
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    
    // 解析筛选参数
    const status = searchParams.get("status") as "DRAFT" | "PUBLISHED" | null;

    // 构建查询条件
    const where: {
      authorId?: string;
      status?: "DRAFT" | "PUBLISHED";
    } = {};

    // 非管理员只能看到自己的文章
    if (session.user.role !== "ADMIN") {
      where.authorId = session.user.id;
    }

    // 按状态筛选
    if (status === "DRAFT" || status === "PUBLISHED") {
      where.status = status;
    }

    // 获取总数
    const total = await prisma.post.count({ where });

    // 获取文章列表
    const posts = await prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
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

    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary,
      coverUrl: post.coverUrl,
      status: post.status,
      views: post.views,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      authorId: post.authorId,
      categoryId: post.categoryId,
      tags: post.tags.map((pt) => pt.tag),
    }));

    return NextResponse.json({
      posts: transformedPosts,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/posts - 创建新文章
 * 需要认证
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户认证状态
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreatePostRequest = await request.json();

    // 验证必填字段
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Invalid parameters", details: { title: "Title is required" } },
        { status: 400 }
      );
    }

    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Invalid parameters", details: { content: "Content is required" } },
        { status: 400 }
      );
    }

    // 生成 slug（基于标题）
    const baseSlug = generateSlug(body.title);
    
    // 获取所有已存在的 slug 以确保唯一性
    const existingPosts = await prisma.post.findMany({
      select: { slug: true },
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
    });
    const existingSlugs = existingPosts.map((p) => p.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    // 确定发布状态和发布时间
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const publishedAt = status === "PUBLISHED" ? new Date() : null;

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title: body.title.trim(),
        slug,
        content: body.content,
        summary: body.summary?.trim() || null,
        coverUrl: body.coverUrl || null,
        status,
        publishedAt,
        authorId: session.user.id,
        categoryId: body.categoryId || null,
        // 创建标签关联
        tags: body.tagIds && body.tagIds.length > 0
          ? {
              create: body.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
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

    // 构建响应
    const response: PostResponse = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary,
      coverUrl: post.coverUrl,
      status: post.status,
      views: post.views,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      authorId: post.authorId,
      categoryId: post.categoryId,
      tags: post.tags.map((pt) => pt.tag),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
