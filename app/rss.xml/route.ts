import prisma from "@/lib/prisma";
import { siteConfig } from "@/lib/metadata";

// 强制动态渲染，避免构建时数据库连接问题
export const dynamic = "force-dynamic";

/**
 * RSS Feed 生成路由
 * 生成符合 RSS 2.0 规范的 feed，包含最新已发布文章
 * Requirements: 9.4
 *
 * Property 19: RSS Feed 正确性
 * - 包含最新已发布文章
 * - 格式符合 RSS 2.0 规范
 * - 不包含草稿文章
 */

/**
 * 转义 XML 特殊字符
 * 防止 XSS 攻击和 XML 解析错误
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 将日期转换为 RFC 822 格式
 * RSS 2.0 规范要求的日期格式
 */
function toRfc822Date(date: Date): string {
  return date.toUTCString();
}

/**
 * 生成单个文章的 RSS item XML
 */
function generateRssItem(post: {
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  publishedAt: Date | null;
  author: { name: string | null } | null;
  tags: Array<{ tag: { name: string } }>;
}): string {
  const postUrl = `${siteConfig.url}/posts/${post.slug}`;
  const description = post.summary || post.content.substring(0, 200) + "...";
  const pubDate = post.publishedAt
    ? toRfc822Date(post.publishedAt)
    : toRfc822Date(new Date());
  const authorName = post.author?.name || siteConfig.author.name;

  // 生成分类标签
  const categories = post.tags
    .map((pt) => `    <category>${escapeXml(pt.tag.name)}</category>`)
    .join("\n");

  return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <description>${escapeXml(description)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>${escapeXml(siteConfig.author.email)} (${escapeXml(authorName)})</author>
${categories}
  </item>`;
}

/**
 * 生成完整的 RSS 2.0 XML
 */
function generateRssFeed(
  posts: Array<{
    title: string;
    slug: string;
    summary: string | null;
    content: string;
    publishedAt: Date | null;
    author: { name: string | null } | null;
    tags: Array<{ tag: { name: string } }>;
  }>
): string {
  const lastBuildDate = posts.length > 0 && posts[0].publishedAt
    ? toRfc822Date(posts[0].publishedAt)
    : toRfc822Date(new Date());

  const items = posts.map(generateRssItem).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.locale}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js Blog System</generator>
    <managingEditor>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</managingEditor>
    <webMaster>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</webMaster>
${items}
  </channel>
</rss>`;
}

/**
 * GET /rss.xml
 * 返回 RSS 2.0 格式的 feed
 */
export async function GET() {
  try {
    // 获取最新的已发布文章（最多 20 篇）
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        title: true,
        slug: true,
        summary: true,
        content: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 20,
    });

    const rssFeed = generateRssFeed(posts);

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("生成 RSS Feed 失败:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
