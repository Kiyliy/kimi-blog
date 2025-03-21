# 组件设计架构

本目录包含博客系统的React组件，采用功能分离和组件复用的原则设计。

## 主要组件

### 布局组件 (Layout.tsx)

提供整个博客的基本布局结构，包括：
- 固定的左侧边栏 (width: 16rem)
- 右侧主内容区域，带有适当的内边距和最大宽度限制

这种简洁的双栏布局使导航和内容浏览更加直观，同时保持了界面的简洁性。

### 侧边栏组件 (Sidebar.tsx)

负责显示导航菜单，包括：
- 博客标题和描述
- 主导航链接（首页、归档、关于等）
- 动态加载的文章分类列表
- 页脚版权信息

侧边栏使用了中间件获取分类数据，展示了数据与UI分离的良好实践。

### 文章卡片组件 (PostCard.tsx)

用于在文章列表中显示文章预览，包括：
- 文章封面图片（如果有）
- 文章标题
- 发布日期和标签
- 文章摘要

卡片设计简洁大方，重点突出文章标题和摘要，同时提供足够的元数据。

### 文章头部组件 (PostHeader.tsx)

用于显示单篇文章的头部信息，包括：
- 文章标题
- 作者信息（如果有）
- 发布日期
- 分类和标签
- 封面图片（如果有）

头部设计注重信息的层次感，通过字体大小和颜色区分不同元素的重要性。

### 文章正文组件 (PostBody.tsx)

负责渲染文章的Markdown内容，使用ReactMarkdown处理文章内容，并应用自定义样式。整合了代码高亮和GitHub风格的Markdown扩展。

## 设计原则

1. **组件化和复用性** - 每个组件都有明确的单一职责
2. **关注点分离** - UI渲染与数据获取分离
3. **响应式设计** - 所有组件适应不同屏幕尺寸
4. **一致的视觉风格** - 使用统一的配色方案和间距

## 样式方案

使用Tailwind CSS工具类实现样式，主要利用：
- 自定义的米色主题（cream-50到cream-500）
- 墨水色调系列（ink-light, ink-default, ink-dark）
- 一致的间距和排版

避免了组件级的CSS文件，简化了样式管理。