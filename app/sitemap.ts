import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { siteConfig } from "@/lib/metadata";

// 强制动态渲染，避免构建时数据库连接问题
export const dynamic = "force-dynamic";

/**
 * 生成站点地图
 * 包含所有已发布文章 URL 和静态页面 URL
 * Requirements: 9.3
 * 
 * Property 18: Sitemap 包含所有公开页面
 * - 包含所有已发布文章的 URL
 * - 不包含草稿文章
 * - 包含静态页面（首页、关于、标签、搜索等）
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // 获取所有已发布文章
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  // 获取所有标签
  const tags = await prisma.tag.findMany({
    select: {
      slug: true,
    },
  });

  // 获取所有分类
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
    },
  });

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/links`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 文章页面
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 标签页面
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 分类页面
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...tagPages, ...categoryPages];
}
