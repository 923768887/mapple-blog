import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/password";

/**
 * 用户管理 API
 * 仅超级管理员（ADMIN）可访问
 */

// GET /api/admin/users - 获取所有用户列表
export async function GET() {
  try {
    const session = await getSession();

    // 验证是否为超级管理员
    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        postCount: user._count.posts,
        createdAt: user.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { error: "获取用户列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - 创建新用户（管理员创建）
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // 验证是否为超级管理员
    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    const { email, password, name, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 创建用户
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split("@")[0],
        role: role === "ADMIN" ? "ADMIN" : "AUTHOR",
      },
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
    console.error("创建用户失败:", error);
    return NextResponse.json(
      { error: "创建用户失败" },
      { status: 500 }
    );
  }
}
