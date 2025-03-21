# 优雅博客 - 设计架构文档

这是一个简洁优雅的个人博客网站，采用现代前端技术栈构建，注重内容展示和用户体验。

## 项目结构

```
test1/
├── content/               # 文章内容目录
│   └── posts/             # Markdown 格式的博客文章
├── public/                # 静态资源
├── src/
│   ├── components/        # React 组件
│   ├── hooks/             # 自定义 React hooks
│   ├── middleware/        # 中间件，包括文章数据获取
│   ├── pages/             # Next.js 页面组件
│   ├── styles/            # 全局样式
│   └── types/             # TypeScript 类型定义
├── next.config.js         # Next.js 配置
├── package.json           # 项目依赖
├── tailwind.config.js     # Tailwind CSS 配置
└── tsconfig.json          # TypeScript 配置
```

## 设计理念

博客采用极简设计风格，主要特点包括：

1. **简洁的双栏布局** - 左侧边栏用于导航，右侧主区域显示内容
2. **淡雅的米色主题** - 柔和、低对比度的色彩方案，降低视觉疲劳
3. **墨水点击效果** - 点击时的墨水扩散效果增加交互趣味性
4. **内容优先** - 设计服务于内容，最大化可读性和舒适度

## 技术栈

- **框架**: Next.js (React)
- **语言**: TypeScript
- **样式**: Tailwind CSS + @tailwindcss/typography
- **内容**: Markdown (gray-matter + remark)
- **格式化**: date-fns
- **动画**: CSS 动画 + Keyframes

## 特性

- 按分类和标签浏览文章
- 时间线式归档视图
- 响应式设计
- 优化的文章内容渲染
- 可扩展的中间件数据层，支持不同数据源
- 鼠标点击的墨水扩散效果

## 未来计划

- Notion API 集成，直接从 Notion 获取内容
- 搜索功能
- 暗黑模式
- 评论系统集成
- 站点统计与分析
- RSS 订阅支持