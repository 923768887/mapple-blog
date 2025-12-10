# 📝 Next.js 博客系统

一个基于 **Next.js 16** 的全栈个人博客系统，采用现代化技术栈和架构设计，支持访客阅读、作者创作与后台管理。

## ✨ 核心特性

- 🚀 **现代化技术栈** - Next.js 16 App Router + React 19 + TypeScript
- 🎨 **精美 UI** - Tailwind CSS 4 + Shadcn UI 组件库
- 🔐 **安全认证** - NextAuth v5 身份认证
- 📊 **数据持久化** - Prisma ORM + PostgreSQL
- 🌙 **主题切换** - 支持明暗主题 + 自定义主题颜色
- 📱 **响应式设计** - 完美适配桌面、平板、移动设备
- 🔍 **SEO 优化** - 完整的 Meta 标签、Sitemap、RSS Feed
- ✍️ **Markdown 编辑** - 实时预览的 Markdown 编辑器，支持 GFM 语法

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 前端 | React 19, TypeScript |
| 样式 | Tailwind CSS 4, Shadcn UI |
| 数据库 | PostgreSQL |
| ORM | Prisma 7 |
| 认证 | NextAuth v5 |
| 部署 | Vercel |

## 📦 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd my-app
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# PostgreSQL 连接字符串
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blog_db?schema=public"

# NextAuth 配置
AUTH_SECRET="your-secret-key-here"  # 使用 openssl rand -base64 32 生成
AUTH_URL="http://localhost:3000"
```

4. **初始化数据库**

```bash
# 执行数据库迁移
pnpm db:migrate

# 填充初始数据（可选）
pnpm db:seed
```

5. **启动开发服务器**

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看博客前台。

## 📁 项目结构

```
my-app/
├── app/                    # Next.js App Router 页面
│   ├── (admin)/           # 后台管理页面（带侧边栏布局）
│   ├── api/               # API 路由
│   ├── posts/             # 文章详情页
│   ├── categories/        # 分类页面
│   ├── tags/              # 标签页面
│   ├── search/            # 搜索页面
│   ├── about/             # 关于页面
│   ├── links/             # 友情链接页面
│   └── login/             # 登录页面
├── components/            # React 组件
│   ├── admin/             # 后台管理组件
│   ├── editor/            # Markdown 编辑器
│   ├── layout/            # 布局组件
│   ├── posts/             # 文章相关组件
│   └── ui/                # Shadcn UI 组件
├── lib/                   # 工具函数和配置
│   ├── auth.ts            # NextAuth 配置
│   ├── prisma.ts          # Prisma 客户端
│   ├── markdown.ts        # Markdown 解析
│   └── metadata.ts        # SEO 元数据
├── prisma/                # Prisma 配置
│   ├── schema.prisma      # 数据库模型
│   ├── migrations/        # 数据库迁移
│   └── seed.ts            # 种子数据
├── hooks/                 # 自定义 React Hooks
├── types/                 # TypeScript 类型定义
└── public/                # 静态资源
```

## 🗄️ 数据模型

```
User          # 用户（管理员/作者）
Post          # 文章
Category      # 分类
Tag           # 标签
PostTag       # 文章-标签关联
Setting       # 站点设置
```

## 📜 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器

# 构建
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # 运行 ESLint

# 数据库
pnpm db:generate      # 生成 Prisma 客户端
pnpm db:migrate       # 执行数据库迁移（开发）
pnpm db:migrate:deploy # 执行数据库迁移（生产）
pnpm db:push          # 推送 schema 到数据库
pnpm db:seed          # 填充种子数据
pnpm db:studio        # 打开 Prisma Studio
pnpm db:reset         # 重置数据库
```

## 🚀 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `DATABASE_URL` - PostgreSQL 连接字符串
   - `AUTH_SECRET` - NextAuth 密钥
   - `AUTH_URL` - 生产环境 URL
4. 部署完成后，运行数据库迁移：

```bash
pnpm db:migrate:deploy
```

### 数据库推荐

- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - 开源 Firebase 替代品
- [Railway](https://railway.app) - 简单的云数据库

## 🔧 后台管理

访问 `/admin` 进入后台管理系统：

- **仪表盘** - 数据统计概览
- **文章管理** - 创建、编辑、删除文章
- **分类管理** - 管理文章分类
- **标签管理** - 管理文章标签
- **友链管理** - 管理友情链接
- **站点设置** - 配置站点信息、主题颜色、社交链接等

## 📄 License

MIT License

