import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// 更新分类请求体类型
export interface UpdateCategoryRequest {
  name?: string;
}

// 分类响应类型
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

/**
 * GET /api/categories/[id] - 获取单个分类详情
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const response = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt.toISOString(),
      postCount: category._count.posts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取分类详情失败:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}


/**
 * PUT /api/categories/[id] - 更新分类
 * 需要认证
 * 验证分类名称唯一性
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

    // 查找现有分类
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const body: UpdateCategoryRequest = await request.json();

    // 验证名称字段
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid parameters", details: { name: "分类名称不能为空" } },
        { status: 400 }
      );
    }

    const categoryName = body.name.trim();

    // 如果名称变更，检查唯一性
    if (categoryName !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Invalid parameters", details: { name: "分类名称已存在" } },
          { status: 400 }
        );
      }
    }

    // 准备更新数据
    const updateData: { name: string; slug?: string } = {
      name: categoryName,
    };

    // 如果名称变更，重新生成 slug
    if (categoryName !== existingCategory.name) {
      const baseSlug = generateSlug(categoryName);

      // 获取所有已存在的 slug（排除当前分类）
      const existingCategories = await prisma.category.findMany({
        select: { slug: true },
        where: {
          slug: { startsWith: baseSlug },
          id: { not: id },
        },
      });
      const existingSlugs = existingCategories.map((c) => c.slug);
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // 更新分类
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    const response: CategoryResponse = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/categories/[id] - 删除分类
 * 需要认证
 * Requirements 6.4: 移除分类记录，关联文章的分类字段设为空
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

    // 查找现有分类
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // 使用事务确保数据一致性
    // Requirements 6.4: 删除分类时，关联文章的 categoryId 设为 null
    await prisma.$transaction(async (tx) => {
      // 先将关联文章的 categoryId 设为 null
      await tx.post.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });

      // 然后删除分类
      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: "分类删除成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
