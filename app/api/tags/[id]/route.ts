import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// 更新标签请求体类型
export interface UpdateTagRequest {
  name?: string;
}

// 标签响应类型
export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

/**
 * GET /api/tags/[id] - 获取单个标签详情
 * 公开接口，无需认证
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    const response = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
      postCount: tag._count.posts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取标签详情失败:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tags/[id] - 更新标签
 * 需要认证
 * 验证标签名称唯一性
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户认证状态
    const session = await getSession();

    if (!session?.userId) {
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

    // 查找现有标签
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    const body: UpdateTagRequest = await request.json();

    // 验证名称字段
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid parameters", details: { name: "标签名称不能为空" } },
        { status: 400 }
      );
    }

    const tagName = body.name.trim();

    // 如果名称变更，检查唯一性
    if (tagName !== existingTag.name) {
      const duplicateTag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (duplicateTag) {
        return NextResponse.json(
          { error: "Invalid parameters", details: { name: "标签名称已存在" } },
          { status: 400 }
        );
      }
    }

    // 准备更新数据
    const updateData: { name: string; slug?: string } = {
      name: tagName,
    };

    // 如果名称变更，重新生成 slug
    if (tagName !== existingTag.name) {
      const baseSlug = generateSlug(tagName);

      // 获取所有已存在的 slug（排除当前标签）
      const existingTags = await prisma.tag.findMany({
        select: { slug: true },
        where: {
          slug: { startsWith: baseSlug },
          id: { not: id },
        },
      });
      const existingSlugs = existingTags.map((t) => t.slug);
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // 更新标签
    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    const response: TagResponse = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tags/[id] - 删除标签
 * 需要认证
 * Requirements 6.2: 移除标签记录并解除与文章的关联
 * 注意：PostTag 关联会通过 onDelete: Cascade 自动删除
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户认证状态
    const session = await getSession();

    if (!session?.userId) {
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

    // 查找现有标签
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // 删除标签
    // PostTag 关联会通过 Prisma schema 中的 onDelete: Cascade 自动删除
    // 这样文章本身会保留，但不再包含该标签（Requirements 6.2）
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "标签删除成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
