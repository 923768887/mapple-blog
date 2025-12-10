/**
 * Markdown 处理工具
 * 
 * 提供 Markdown 解析、HTML 转换和目录生成功能
 * 
 * Requirements: 2.3, 11.3
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

/**
 * 目录项接口
 */
export interface TocItem {
  /** 标题 ID（用于锚点跳转） */
  id: string;
  /** 标题文本 */
  text: string;
  /** 标题层级（1-6） */
  level: number;
  /** 子标题列表 */
  children: TocItem[];
}

/**
 * Markdown 解析结果
 */
export interface MarkdownResult {
  /** 转换后的 HTML 内容 */
  html: string;
  /** 目录结构 */
  toc: TocItem[];
}

/**
 * 从 Markdown 内容中提取标题，生成目录结构
 * 
 * @param markdown - Markdown 原始内容
 * @returns 目录项数组（扁平结构）
 */
export function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  
  // 匹配 Markdown 标题（# 到 ######）
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // 生成 slug ID（与 rehype-slug 保持一致）
    const id = generateSlug(text);
    
    headings.push({
      id,
      text,
      level,
      children: [],
    });
  }
  
  return headings;
}

/**
 * 将扁平的标题列表转换为嵌套的目录树结构
 * 
 * @param headings - 扁平的标题列表
 * @returns 嵌套的目录树
 */
export function buildTocTree(headings: TocItem[]): TocItem[] {
  if (headings.length === 0) {
    return [];
  }
  
  const result: TocItem[] = [];
  const stack: TocItem[] = [];
  
  for (const heading of headings) {
    // 创建新的目录项（避免修改原对象）
    const item: TocItem = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: [],
    };
    
    // 找到合适的父节点
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // 没有父节点，添加到根级别
      result.push(item);
    } else {
      // 添加到父节点的 children 中
      stack[stack.length - 1].children.push(item);
    }
    
    stack.push(item);
  }
  
  return result;
}

/**
 * 生成 URL 友好的 slug
 * 与 rehype-slug 的默认行为保持一致
 * 
 * @param text - 原始文本
 * @returns slug 字符串
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    // 移除特殊字符，保留中文、字母、数字、空格和连字符
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    // 将空格替换为连字符
    .replace(/\s+/g, '-')
    // 移除连续的连字符
    .replace(/-+/g, '-')
    // 移除首尾的连字符
    .replace(/^-|-$/g, '');
}

/**
 * 将 Markdown 内容解析为 HTML
 * 
 * 功能：
 * - 解析标准 Markdown 语法
 * - 代码块语法高亮
 * - 自动为标题添加 ID（用于锚点）
 * - 为标题添加自动链接
 * 
 * @param markdown - Markdown 原始内容
 * @returns HTML 字符串
 */
export async function parseMarkdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['anchor-link'],
      },
    })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  
  return String(result);
}

/**
 * 解析 Markdown 内容，返回 HTML 和目录结构
 * 
 * @param markdown - Markdown 原始内容
 * @returns 包含 HTML 和目录的结果对象
 */
export async function parseMarkdown(markdown: string): Promise<MarkdownResult> {
  // 并行处理 HTML 转换和目录提取
  const [html, headings] = await Promise.all([
    parseMarkdownToHtml(markdown),
    Promise.resolve(extractHeadings(markdown)),
  ]);
  
  // 构建嵌套的目录树
  const toc = buildTocTree(headings);
  
  return {
    html,
    toc,
  };
}

/**
 * 同步版本：仅提取目录（不进行 HTML 转换）
 * 用于需要快速获取目录结构的场景
 * 
 * @param markdown - Markdown 原始内容
 * @returns 目录树结构
 */
export function extractToc(markdown: string): TocItem[] {
  const headings = extractHeadings(markdown);
  return buildTocTree(headings);
}
