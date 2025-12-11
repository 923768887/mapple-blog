import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/password";

/**
 * 单个用户管理 API
 * 仅超级管理员（ADMIN）可访问
 */

// GET /api/admin/users/[id] - 获取单个用户详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      postCount: user._count.posts,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("获取用户详情失败:", error);
    return NextResponse.json(
      { error: "获取用户详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { name, role, password } = await request.json();

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: {
      name?: string;
      role?: "ADMIN" | "AUTHOR";
      passwordHash?: string;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (role !== undefined && (role === "ADMIN" || role === "AUTHOR")) {
      updateData.role = role;
    }

    if (password && password.length >= 6) {
      updateData.passwordHash = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("更新用户失败:", error);
    return NextResponse.json(
      { error: "更新用户失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - 删除用户
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // 不能删除自己
    if (id === session.userId) {
      return NextResponse.json(
        { error: "不能删除自己的账号" },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 删除用户（关联的文章会因为外键约束而需要处理）
    // 这里选择将文章的 authorId 设为 null 或删除文章
    // 为了数据安全，我们先检查用户是否有文章
    const postCount = await prisma.post.count({
      where: { authorId: id },
    });

    if (postCount > 0) {
      return NextResponse.json(
        { error: `该用户还有 ${postCount} 篇文章，请先删除或转移文章` },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "用户已删除",
    });
  } catch (error) {
    console.error("删除用户失败:", error);
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
}
