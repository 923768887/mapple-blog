import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("🌱 开始播种数据...");

  // 清理现有数据（按依赖顺序）
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  console.log("✅ 已清理现有数据");

  // 创建测试用户
  const adminPassword = await hashPassword("admin123");
  const authorPassword = await hashPassword("author123");

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      name: "管理员",
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  const author = await prisma.user.create({
    data: {
      email: "author@example.com",
      passwordHash: authorPassword,
      name: "作者小明",
      role: "AUTHOR",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=author",
    },
  });


  console.log("✅ 已创建测试用户");

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "JavaScript", slug: "javascript" } }),
    prisma.tag.create({ data: { name: "TypeScript", slug: "typescript" } }),
    prisma.tag.create({ data: { name: "React", slug: "react" } }),
    prisma.tag.create({ data: { name: "Next.js", slug: "nextjs" } }),
    prisma.tag.create({ data: { name: "Node.js", slug: "nodejs" } }),
    prisma.tag.create({ data: { name: "CSS", slug: "css" } }),
    prisma.tag.create({ data: { name: "数据库", slug: "database" } }),
    prisma.tag.create({ data: { name: "DevOps", slug: "devops" } }),
  ]);

  console.log("✅ 已创建标签");

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "前端开发", slug: "frontend" } }),
    prisma.category.create({ data: { name: "后端开发", slug: "backend" } }),
    prisma.category.create({ data: { name: "全栈教程", slug: "fullstack" } }),
    prisma.category.create({ data: { name: "技术随笔", slug: "thoughts" } }),
  ]);

  console.log("✅ 已创建分类");

  // 创建文章
  const now = new Date();
  const posts = [
    {
      title: "Next.js 16 新特性详解",
      slug: "nextjs-16-new-features",
      content: `# Next.js 16 新特性详解

Next.js 16 带来了许多令人兴奋的新特性，让我们一起来看看。

## App Router 改进

App Router 在 Next.js 16 中得到了进一步优化，性能提升显著。

### 服务端组件

服务端组件现在支持更多的使用场景：

- 更好的数据获取
- 更快的首屏渲染
- 更小的客户端包体积

## 总结

Next.js 16 是一个重要的版本更新，值得升级体验。`,
      summary: "深入了解 Next.js 16 的新特性，包括 App Router 改进、服务端组件优化等。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      categoryId: categories[0].id,
      tagIds: [tags[3].id, tags[1].id, tags[2].id],
    },
    {
      title: "TypeScript 高级类型技巧",
      slug: "typescript-advanced-types",
      content: `# TypeScript 高级类型技巧

TypeScript 的类型系统非常强大，本文介绍一些高级技巧。

## 条件类型

条件类型允许我们根据条件选择不同的类型：

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
\`\`\`

## 映射类型

映射类型可以基于现有类型创建新类型：

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

## 模板字面量类型

TypeScript 4.1 引入的模板字面量类型非常实用。`,
      summary: "掌握 TypeScript 的条件类型、映射类型和模板字面量类型等高级特性。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      authorId: author.id,
      categoryId: categories[0].id,
      tagIds: [tags[1].id, tags[0].id],
    },

    {
      title: "React 状态管理最佳实践",
      slug: "react-state-management-best-practices",
      content: `# React 状态管理最佳实践

状态管理是 React 应用开发中的核心话题。

## 本地状态 vs 全局状态

首先要区分什么时候使用本地状态，什么时候使用全局状态。

### 本地状态

- 表单输入
- UI 状态（展开/折叠）
- 临时数据

### 全局状态

- 用户认证信息
- 主题设置
- 跨组件共享的数据

## 推荐方案

1. **useState/useReducer** - 本地状态
2. **Context API** - 简单的全局状态
3. **Zustand** - 中等复杂度
4. **Redux Toolkit** - 大型应用`,
      summary: "探讨 React 应用中状态管理的各种方案和最佳实践。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      categoryId: categories[0].id,
      tagIds: [tags[2].id, tags[0].id],
    },
    {
      title: "Node.js 性能优化指南",
      slug: "nodejs-performance-optimization",
      content: `# Node.js 性能优化指南

本文介绍 Node.js 应用的性能优化技巧。

## 异步编程

正确使用异步编程是 Node.js 性能的关键。

### 避免阻塞事件循环

\`\`\`javascript
// 不好的做法
const data = fs.readFileSync('file.txt');

// 好的做法
const data = await fs.promises.readFile('file.txt');
\`\`\`

## 内存管理

- 避免内存泄漏
- 使用流处理大文件
- 合理使用缓存

## 数据库优化

- 使用连接池
- 添加适当的索引
- 避免 N+1 查询`,
      summary: "全面介绍 Node.js 应用的性能优化策略，包括异步编程、内存管理和数据库优化。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      authorId: author.id,
      categoryId: categories[1].id,
      tagIds: [tags[4].id, tags[6].id],
    },
    {
      title: "CSS Grid 布局完全指南",
      slug: "css-grid-complete-guide",
      content: `# CSS Grid 布局完全指南

CSS Grid 是现代网页布局的强大工具。

## 基础概念

Grid 布局由容器和项目组成。

### 定义网格

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`

## 常用属性

- grid-template-columns
- grid-template-rows
- gap
- grid-area

## 实战案例

响应式卡片布局、圣杯布局等。`,
      summary: "从基础到进阶，全面掌握 CSS Grid 布局技术。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      categoryId: categories[0].id,
      tagIds: [tags[5].id],
    },

    {
      title: "PostgreSQL 索引优化实战",
      slug: "postgresql-index-optimization",
      content: `# PostgreSQL 索引优化实战

数据库索引是提升查询性能的关键。

## 索引类型

PostgreSQL 支持多种索引类型：

- B-tree（默认）
- Hash
- GiST
- GIN

## 创建索引

\`\`\`sql
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status) WHERE status = 'PUBLISHED';
\`\`\`

## 分析查询

使用 EXPLAIN ANALYZE 分析查询计划。`,
      summary: "深入理解 PostgreSQL 索引机制，学习如何优化数据库查询性能。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      authorId: author.id,
      categoryId: categories[1].id,
      tagIds: [tags[6].id],
    },
    {
      title: "全栈开发者的 DevOps 入门",
      slug: "devops-for-fullstack-developers",
      content: `# 全栈开发者的 DevOps 入门

作为全栈开发者，了解 DevOps 实践非常重要。

## CI/CD 基础

持续集成和持续部署是现代开发的标配。

### GitHub Actions

\`\`\`yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
\`\`\`

## Docker 容器化

容器化让部署变得简单可靠。

## 监控与日志

- 应用监控
- 日志聚合
- 告警设置`,
      summary: "为全栈开发者准备的 DevOps 入门指南，涵盖 CI/CD、Docker 和监控。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      categoryId: categories[2].id,
      tagIds: [tags[7].id, tags[4].id],
    },
    {
      title: "我的编程学习心得",
      slug: "my-programming-learning-experience",
      content: `# 我的编程学习心得

分享一些编程学习的心得体会。

## 保持好奇心

技术在不断发展，保持学习的热情很重要。

## 动手实践

看再多教程不如自己动手写代码。

## 参与开源

参与开源项目是提升技能的好方法。

## 总结

编程是一场马拉松，不是短跑。`,
      summary: "分享个人编程学习的心得体会和建议。",
      status: "PUBLISHED" as const,
      publishedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      authorId: author.id,
      categoryId: categories[3].id,
      tagIds: [],
    },
    {
      title: "即将发布：Prisma ORM 深度解析",
      slug: "prisma-orm-deep-dive",
      content: `# Prisma ORM 深度解析

这是一篇关于 Prisma ORM 的深度文章，正在撰写中...

## 大纲

1. Prisma 简介
2. Schema 设计
3. 查询优化
4. 迁移管理`,
      summary: "深入解析 Prisma ORM 的使用技巧和最佳实践。",
      status: "DRAFT" as const,
      publishedAt: null,
      authorId: admin.id,
      categoryId: categories[1].id,
      tagIds: [tags[1].id, tags[6].id],
    },
    {
      title: "草稿：React Server Components",
      slug: "react-server-components-draft",
      content: `# React Server Components

草稿内容，待完善...`,
      summary: "React Server Components 的介绍和使用指南。",
      status: "DRAFT" as const,
      publishedAt: null,
      authorId: author.id,
      categoryId: categories[0].id,
      tagIds: [tags[2].id],
    },
  ];


  // 创建文章和关联标签
  for (const postData of posts) {
    const { tagIds, ...data } = postData;
    const post = await prisma.post.create({
      data: {
        ...data,
        views: Math.floor(Math.random() * 500) + 10,
      },
    });

    // 创建文章-标签关联
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      });
    }
  }

  console.log("✅ 已创建文章");

  // 创建站点设置
  await prisma.setting.createMany({
    data: [
      { key: "site_title", value: "我的技术博客" },
      { key: "site_description", value: "分享前端、后端和全栈开发的技术文章" },
      { key: "site_keywords", value: "JavaScript,TypeScript,React,Next.js,Node.js" },
      { key: "posts_per_page", value: "10" },
    ],
  });

  console.log("✅ 已创建站点设置");

  // 输出统计信息
  const userCount = await prisma.user.count();
  const tagCount = await prisma.tag.count();
  const categoryCount = await prisma.category.count();
  const postCount = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { status: "PUBLISHED" } });
  const draftCount = await prisma.post.count({ where: { status: "DRAFT" } });

  console.log("\n📊 数据统计:");
  console.log(`   用户: ${userCount}`);
  console.log(`   标签: ${tagCount}`);
  console.log(`   分类: ${categoryCount}`);
  console.log(`   文章: ${postCount} (已发布: ${publishedCount}, 草稿: ${draftCount})`);
  console.log("\n🎉 种子数据播种完成!");
  console.log("\n📝 测试账号:");
  console.log("   管理员: admin@example.com / admin123");
  console.log("   作者: author@example.com / author123");
}

main()
  .catch((e) => {
    console.error("❌ 播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
