import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// 更新文章请求体类型
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  summary?: string;
  coverUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
  categoryId?: string | null;
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
 * GET /api/admin/posts/[id] - 获取文章详情（后台管理用，支持草稿）
 * 需要认证
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 验证用户是否有权限访问（作者本人或管理员）
    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/posts/[id] - 更新文章
 * 需要认证，仅作者本人或管理员可更新
 * 编辑已发布文章时保留原发布时间（Requirements 5.6）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    // 查找现有文章
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 验证用户权限（作者本人或管理员）
    if (existingPost.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body: UpdatePostRequest = await request.json();

    // 准备更新数据
    const updateData: {
      title?: string;
      slug?: string;
      content?: string;
      summary?: string | null;
      coverUrl?: string | null;
      status?: "DRAFT" | "PUBLISHED";
      publishedAt?: Date | null;
      categoryId?: string | null;
    } = {};

    // 如果标题变更，重新生成 slug
    if (body.title !== undefined && body.title.trim() !== existingPost.title) {
      updateData.title = body.title.trim();
      const baseSlug = generateSlug(body.title);
      
      // 获取所有已存在的 slug（排除当前文章）
      const existingPosts = await prisma.post.findMany({
        select: { slug: true },
        where: {
          slug: { startsWith: baseSlug },
          id: { not: id },
        },
      });
      const existingSlugs = existingPosts.map((p) => p.slug);
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    if (body.content !== undefined) {
      updateData.content = body.content;
    }

    if (body.summary !== undefined) {
      updateData.summary = body.summary?.trim() || null;
    }

    if (body.coverUrl !== undefined) {
      updateData.coverUrl = body.coverUrl || null;
    }

    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId || null;
    }

    // 处理发布状态切换逻辑
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      if (body.status === "PUBLISHED") {
        // 如果从草稿切换为发布，设置发布时间
        // 如果已经是发布状态，保留原发布时间（Requirements 5.6）
        if (existingPost.status === "DRAFT") {
          updateData.publishedAt = new Date();
        }
        // 已发布文章编辑时不更新 publishedAt
      } else if (body.status === "DRAFT") {
        // 如果切换回草稿，清除发布时间
        updateData.publishedAt = null;
      }
    }


    // 使用事务处理标签更新和文章更新
    const post = await prisma.$transaction(async (tx) => {
      // 如果提供了 tagIds，更新标签关联
      if (body.tagIds !== undefined) {
        // 删除现有标签关联
        await tx.postTag.deleteMany({
          where: { postId: id },
        });

        // 创建新的标签关联
        if (body.tagIds.length > 0) {
          await tx.postTag.createMany({
            data: body.tagIds.map((tagId) => ({
              postId: id,
              tagId,
            })),
          });
        }
      }

      // 更新文章
      return tx.post.update({
        where: { id },
        data: updateData,
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
    });

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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts/[id] - 删除文章
 * 需要认证，仅作者本人或管理员可删除
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    // 查找现有文章
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 验证用户权限（作者本人或管理员）
    if (existingPost.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 删除文章（PostTag 关联会通过 onDelete: Cascade 自动删除）
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
