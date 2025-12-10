/**
 * 文章序列化工具
 * 用于在 Post 对象和 JSON 格式之间进行转换
 * 主要处理日期字段的 ISO 字符串转换
 */

import type { PostStatus } from './generated/prisma/enums';

/**
 * 文章对象类型（包含关联数据）
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  coverUrl: string | null;
  status: PostStatus;
  views: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  categoryId: string | null;
  // 关联数据（可选）
  author?: {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'AUTHOR';
    avatarUrl: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

/**
 * 文章 JSON 格式类型（用于序列化/反序列化）
 * 日期字段转换为 ISO 字符串格式
 */
export interface PostJSON {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  coverUrl: string | null;
  status: PostStatus;
  views: number;
  publishedAt: string | null;  // ISO 日期字符串
  createdAt: string;           // ISO 日期字符串
  updatedAt: string;           // ISO 日期字符串
  authorId: string;
  categoryId: string | null;
  // 关联数据（可选）
  author?: {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'AUTHOR';
    avatarUrl: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tagIds?: string[];  // 标签 ID 列表
}

/**
 * 将 Post 对象序列化为 JSON 格式
 * 主要处理日期字段的 ISO 字符串转换
 * 
 * @param post - 文章对象
 * @returns 序列化后的 JSON 对象
 */
export function serializePost(post: Post): PostJSON {
  // 提取标签 ID 列表
  const tagIds = post.tags?.map(pt => pt.tag.id) ?? [];

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    summary: post.summary,
    coverUrl: post.coverUrl,
    status: post.status,
    views: post.views,
    // 日期字段转换为 ISO 字符串
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    authorId: post.authorId,
    categoryId: post.categoryId,
    // 关联数据
    author: post.author,
    category: post.category,
    tagIds,
  };
}

/**
 * 将 JSON 格式反序列化为 Post 对象
 * 主要处理 ISO 字符串到 Date 对象的转换
 * 
 * @param json - JSON 格式的文章数据
 * @returns 反序列化后的 Post 对象
 */
export function deserializePost(json: PostJSON): Post {
  return {
    id: json.id,
    title: json.title,
    slug: json.slug,
    content: json.content,
    summary: json.summary,
    coverUrl: json.coverUrl,
    status: json.status,
    views: json.views,
    // ISO 字符串转换为 Date 对象
    publishedAt: json.publishedAt ? new Date(json.publishedAt) : null,
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    authorId: json.authorId,
    categoryId: json.categoryId,
    // 关联数据
    author: json.author,
    category: json.category,
    // 从 tagIds 重建 tags 结构（如果有）
    tags: json.tagIds?.map(id => ({
      tag: {
        id,
        name: '',  // 反序列化时无法恢复标签名称，需要从数据库查询
        slug: '',  // 反序列化时无法恢复标签 slug，需要从数据库查询
      },
    })),
  };
}

/**
 * 比较两个 Post 对象是否等价
 * 用于验证序列化往返一致性
 * 
 * @param a - 第一个 Post 对象
 * @param b - 第二个 Post 对象
 * @returns 是否等价
 */
export function isPostEqual(a: Post, b: Post): boolean {
  // 比较基本字段
  if (
    a.id !== b.id ||
    a.title !== b.title ||
    a.slug !== b.slug ||
    a.content !== b.content ||
    a.summary !== b.summary ||
    a.coverUrl !== b.coverUrl ||
    a.status !== b.status ||
    a.views !== b.views ||
    a.authorId !== b.authorId ||
    a.categoryId !== b.categoryId
  ) {
    return false;
  }

  // 比较日期字段（转换为时间戳比较）
  const aPublishedAt = a.publishedAt?.getTime() ?? null;
  const bPublishedAt = b.publishedAt?.getTime() ?? null;
  if (aPublishedAt !== bPublishedAt) {
    return false;
  }

  if (a.createdAt.getTime() !== b.createdAt.getTime()) {
    return false;
  }

  if (a.updatedAt.getTime() !== b.updatedAt.getTime()) {
    return false;
  }

  // 比较作者信息
  if (a.author && b.author) {
    if (
      a.author.id !== b.author.id ||
      a.author.email !== b.author.email ||
      a.author.name !== b.author.name ||
      a.author.role !== b.author.role ||
      a.author.avatarUrl !== b.author.avatarUrl
    ) {
      return false;
    }
  } else if (a.author !== b.author) {
    return false;
  }

  // 比较分类信息
  if (a.category && b.category) {
    if (
      a.category.id !== b.category.id ||
      a.category.name !== b.category.name ||
      a.category.slug !== b.category.slug
    ) {
      return false;
    }
  } else if (a.category !== b.category) {
    return false;
  }

  return true;
}

/**
 * 批量序列化文章列表
 * 
 * @param posts - 文章对象列表
 * @returns 序列化后的 JSON 对象列表
 */
export function serializePosts(posts: Post[]): PostJSON[] {
  return posts.map(serializePost);
}

/**
 * 批量反序列化文章列表
 * 
 * @param jsonList - JSON 格式的文章数据列表
 * @returns 反序列化后的 Post 对象列表
 */
export function deserializePosts(jsonList: PostJSON[]): Post[] {
  return jsonList.map(deserializePost);
}
