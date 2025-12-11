import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// 分类响应类型
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  postCount?: number;
}

// 创建分类请求体类型
export interface CreateCategoryRequest {
  name: string;
}

// 分类列表响应类型
export interface GetCategoriesResponse {
  categories: CategoryResponse[];
  total: number;
}

/**
 * GET /api/categories - 获取所有分类列表
 * 公开接口，无需认证
 */
export async function GET() {
  try {
    // 获取所有分类及其关联的文章数量
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const transformedCategories: CategoryResponse[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt.toISOString(),
      postCount: category._count.posts,
    }));

    const response: GetCategoriesResponse = {
      categories: transformedCategories,
      total: categories.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}


/**
 * POST /api/categories - 创建新分类
 * 需要认证
 * Requirements 6.3: 验证分类名称唯一性后保存分类记录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户认证状态
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateCategoryRequest = await request.json();

    // 验证必填字段
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid parameters", details: { name: "分类名称不能为空" } },
        { status: 400 }
      );
    }

    const categoryName = body.name.trim();

    // 检查分类名称唯一性（Requirements 6.3）
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Invalid parameters", details: { name: "分类名称已存在" } },
        { status: 400 }
      );
    }

    // 生成 slug
    const baseSlug = generateSlug(categoryName);

    // 获取所有已存在的 slug 以确保唯一性
    const existingCategories = await prisma.category.findMany({
      select: { slug: true },
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
    });
    const existingSlugs = existingCategories.map((c) => c.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        slug,
      },
    });

    const response: CategoryResponse = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
