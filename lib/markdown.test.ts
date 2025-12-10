/**
 * Markdown 处理工具测试
 */

import { describe, it, expect } from 'vitest';
import {
  extractHeadings,
  buildTocTree,
  generateSlug,
  parseMarkdownToHtml,
  parseMarkdown,
  extractToc,
} from './markdown';

describe('generateSlug', () => {
  it('应该将英文文本转换为小写 slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('应该处理中文标题', () => {
    expect(generateSlug('你好世界')).toBe('你好世界');
  });

  it('应该移除特殊字符', () => {
    expect(generateSlug('Hello! World?')).toBe('hello-world');
  });

  it('应该处理混合内容', () => {
    expect(generateSlug('第一章 Introduction')).toBe('第一章-introduction');
  });
});

describe('extractHeadings', () => {
  it('应该提取所有标题', () => {
    const markdown = `
# 标题一
## 标题二
### 标题三
`;
    const headings = extractHeadings(markdown);
    
    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({ level: 1, text: '标题一' });
    expect(headings[1]).toMatchObject({ level: 2, text: '标题二' });
    expect(headings[2]).toMatchObject({ level: 3, text: '标题三' });
  });

  it('应该为每个标题生成正确的 ID', () => {
    const markdown = '## Hello World';
    const headings = extractHeadings(markdown);
    
    expect(headings[0].id).toBe('hello-world');
  });

  it('应该处理空内容', () => {
    const headings = extractHeadings('');
    expect(headings).toHaveLength(0);
  });
});

describe('buildTocTree', () => {
  it('应该构建正确的嵌套结构', () => {
    const headings = [
      { id: 'h1', text: 'H1', level: 1, children: [] },
      { id: 'h2-1', text: 'H2-1', level: 2, children: [] },
      { id: 'h3', text: 'H3', level: 3, children: [] },
      { id: 'h2-2', text: 'H2-2', level: 2, children: [] },
    ];
    
    const tree = buildTocTree(headings);
    
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].children).toHaveLength(1);
  });

  it('应该处理空数组', () => {
    const tree = buildTocTree([]);
    expect(tree).toHaveLength(0);
  });
});

describe('parseMarkdownToHtml', () => {
  it('应该将 Markdown 转换为 HTML', async () => {
    const markdown = '# Hello\n\nThis is a **bold** text.';
    const html = await parseMarkdownToHtml(markdown);
    
    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('应该为标题添加 ID', async () => {
    const markdown = '## Test Heading';
    const html = await parseMarkdownToHtml(markdown);
    
    expect(html).toContain('id="test-heading"');
  });

  it('应该处理代码块', async () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    const html = await parseMarkdownToHtml(markdown);
    
    expect(html).toContain('<code');
    // 代码高亮后会添加 span 标签，所以检查关键内容
    expect(html).toContain('hljs');
    expect(html).toContain('const');
  });
});

describe('parseMarkdown', () => {
  it('应该返回 HTML 和目录', async () => {
    const markdown = `
# 第一章
## 1.1 节
## 1.2 节
# 第二章
`;
    const result = await parseMarkdown(markdown);
    
    expect(result.html).toContain('<h1');
    expect(result.toc).toHaveLength(2);
    expect(result.toc[0].children).toHaveLength(2);
  });
});

describe('extractToc', () => {
  it('应该同步提取目录', () => {
    const markdown = `
# 标题一
## 标题二
`;
    const toc = extractToc(markdown);
    
    expect(toc).toHaveLength(1);
    expect(toc[0].text).toBe('标题一');
    expect(toc[0].children[0].text).toBe('标题二');
  });
});
