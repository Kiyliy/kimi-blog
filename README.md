# 优雅博客

一个简洁优雅的个人博客网站，基于Next.js + TypeScript + Tailwind CSS构建，支持Notion集成。

## 功能特点

- 简洁优雅的设计风格，注重阅读体验
- 支持按分类和标签浏览文章
- 时间线式归档视图
- 响应式设计，适配各种设备
- 独特的墨水点击效果
- 支持从Notion获取内容

## 技术栈

- **框架**: Next.js
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **部署**: Vercel/Netlify (推荐)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## Notion集成

本项目支持使用Notion作为CMS，详细配置请参考 [docs/notion-integration.md](docs/notion-integration.md)。

## Git仓库初始化

如果你是首次克隆此项目并想要推送到自己的新仓库，请按照以下步骤操作：

1. 确保已经初始化Git仓库（已完成）：

```bash
git init
```

2. 添加所有文件到暂存区：

```bash
git add .
```

3. 提交第一个版本：

```bash
git commit -m "初始化优雅博客项目"
```

4. 在GitHub/GitLab等平台创建一个新的空仓库

5. 添加远程仓库（替换URL为你的仓库地址）：

```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
```

6. 推送到远程仓库：

```bash
git push -u origin main
# 或者如果你的默认分支是master
git push -u origin master
```

## 目录结构

```
/
├── docs/                # 文档
│   └── notion-integration.md  # Notion集成指南
├── public/              # 静态资源
├── src/
│   ├── components/      # React组件
│   ├── hooks/           # 自定义React hooks
│   ├── middleware/      # 中间件（数据获取）
│   ├── pages/           # Next.js页面
│   ├── styles/          # 全局样式
│   └── types/           # TypeScript类型定义
├── .gitignore           # Git忽略文件
├── next.config.js       # Next.js配置
├── package.json         # 项目依赖
├── tailwind.config.js   # Tailwind CSS配置
└── tsconfig.json        # TypeScript配置
```

## 许可

MIT 