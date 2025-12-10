import { Metadata } from "next";

/**
 * 站点基础配置
 * 用于生成页面元数据
 */
export const siteConfig = {
  name: "我的博客",
  description: "一个基于 Next.js 构建的现代博客系统，分享技术文章和生活感悟",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: {
    name: "博客作者",
    email: "author@example.com",
  },
  keywords: ["博客", "技术", "编程", "Next.js", "React"],
  locale: "zh-CN",
};

/**
 * 生成根布局的基础元数据
 * Requirements: 9.1
 */
export function generateRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * 文章元数据输入参数
 */
export interface PostMetadataInput {
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
  author: {
    name: string | null;
  };
  tags: Array<{ name: string }>;
}

/**
 * 生成文章页面的动态元数据
 * 包含 Open Graph 和 Twitter Card 元数据
 * Requirements: 9.1, 9.2
 */
export function generatePostMetadata(post: PostMetadataInput): Metadata {
  const postUrl = `${siteConfig.url}/posts/${post.slug}`;
  const description = post.summary || `阅读文章：${post.title}`;
  const keywords = post.tags.map((tag) => tag.name);

  return {
    title: post.title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    authors: post.author.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: postUrl,
      siteName: siteConfig.name,
      title: post.title,
      description,
      images: post.coverUrl
        ? [
            {
              url: post.coverUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
      publishedTime: post.publishedAt || undefined,
      authors: post.author.name ? [post.author.name] : undefined,
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

/**
 * 生成标签页面的元数据
 * Requirements: 9.1
 */
export function generateTagMetadata(tagName: string): Metadata {
  const title = `标签：${tagName}`;
  const description = `浏览所有带有「${tagName}」标签的文章`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * 生成分类页面的元数据
 * Requirements: 9.1
 */
export function generateCategoryMetadata(categoryName: string): Metadata {
  const title = `分类：${categoryName}`;
  const description = `浏览「${categoryName}」分类下的所有文章`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * 生成搜索页面的元数据
 * Requirements: 9.1
 */
export function generateSearchMetadata(query?: string): Metadata {
  const title = query ? `搜索：${query}` : "搜索文章";
  const description = query
    ? `搜索「${query}」的结果`
    : "在博客中搜索感兴趣的文章";

  return {
    title,
    description,
    robots: {
      index: false, // 搜索结果页不需要被索引
      follow: true,
    },
  };
}

/**
 * 生成静态页面的元数据
 * Requirements: 9.1
 */
export function generateStaticPageMetadata(
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
