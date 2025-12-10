import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// 标签响应类型
export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  postCount?: number;
}

// 创建标签请求体类型
export interface CreateTagRequest {
  name: string;
}

// 标签列表响应类型
export interface GetTagsResponse {
  tags: TagResponse[];
  total: number;
}

/**
 * GET /api/tags - 获取所有标签列表
 * 公开接口，无需认证
 */
export async function GET() {
  try {
    // 获取所有标签及其关联的文章数量
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const transformedTags: TagResponse[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
      postCount: tag._count.posts,
    }));

    const response: GetTagsResponse = {
      tags: transformedTags,
      total: tags.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取标签列表失败:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags - 创建新标签
 * 需要认证
 * Requirements 6.1: 验证标签名称唯一性后保存标签记录
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

    const body: CreateTagRequest = await request.json();

    // 验证必填字段
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid parameters", details: { name: "标签名称不能为空" } },
        { status: 400 }
      );
    }

    const tagName = body.name.trim();

    // 检查标签名称唯一性（Requirements 6.1）
    const existingTag = await prisma.tag.findUnique({
      where: { name: tagName },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Invalid parameters", details: { name: "标签名称已存在" } },
        { status: 400 }
      );
    }

    // 生成 slug
    const baseSlug = generateSlug(tagName);

    // 获取所有已存在的 slug 以确保唯一性
    const existingTags = await prisma.tag.findMany({
      select: { slug: true },
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
    });
    const existingSlugs = existingTags.map((t) => t.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        name: tagName,
        slug,
      },
    });

    const response: TagResponse = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
