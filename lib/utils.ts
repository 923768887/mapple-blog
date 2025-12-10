import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 根据标题生成 URL 友好的 slug
 * 中文标题会生成基于时间戳的唯一 slug，英文标题保留原有逻辑
 * @param title 文章标题
 * @returns 生成的 slug（纯 ASCII 字符）
 */
export function generateSlug(title: string): string {
  // 移除首尾空白
  let slug = title.trim().toLowerCase();
  
  // 移除中文字符，只保留英文字母、数字和空格
  slug = slug
    .replace(/[^\w\s-]/g, '')          // 移除非字母数字字符（包括中文）
    .replace(/[\s_]+/g, '-')           // 空格和下划线转为连字符
    .replace(/-+/g, '-')               // 多个连字符合并为一个
    .replace(/^-|-$/g, '');            // 移除首尾连字符
  
  // 如果 slug 为空（例如标题全是中文），生成基于时间戳的 slug
  if (!slug) {
    slug = `post-${Date.now()}`;
  }
  
  return slug;
}

/**
 * 生成唯一的 slug，如果已存在则添加数字后缀
 * @param baseSlug 基础 slug
 * @param existingSlugs 已存在的 slug 列表
 * @returns 唯一的 slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}


/**
 * 格式化日期为中文友好格式
 * @param dateString ISO 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
