/**
 * 站点设置 API
 * 
 * GET - 获取所有设置
 * PUT - 批量更新设置
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// 默认设置值
const defaultSettings: Record<string, string> = {
  siteName: "My Blog",
  siteDescription: "一个简洁优雅的博客",
  siteKeywords: "博客,技术,编程",
  siteAuthor: "",
  siteUrl: "",
  siteLogo: "",
  siteFavicon: "",
  // 主题颜色设置
  primaryColor: "#1a1a2e",
  // 社交链接
  socialGithub: "",
  socialTwitter: "",
  socialEmail: "",
  // SEO 设置
  googleAnalyticsId: "",
  // 评论设置
  enableComments: "false",
  // 每页文章数
  postsPerPage: "10",
  // 页脚信息
  footerText: "© 2024 My Blog. All rights reserved.",
  footerIcp: "",
};

// 获取所有设置
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    
    // 合并默认设置和数据库设置
    const result: Record<string, string> = { ...defaultSettings };
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("获取设置失败:", error);
    return NextResponse.json(
      { error: "获取设置失败" },
      { status: 500 }
    );
  }
}

// 批量更新设置（仅超级管理员可操作）
export async function PUT(request: Request) {
  try {
    // 验证登录状态和管理员权限
    const session = await getSession();
    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // 批量更新设置
    const updates = Object.entries(data).map(([key, value]) => 
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新设置失败:", error);
    return NextResponse.json(
      { error: "更新设置失败" },
      { status: 500 }
    );
  }
}
