# 样式设计架构

本目录包含博客系统的全局样式定义，基于 Tailwind CSS 框架构建。

## 样式理念

博客采用简约、优雅的设计风格，主要特点包括：

1. **淡雅米色主题** - 选用柔和的米色作为背景，减轻视觉疲劳，创造舒适的阅读环境
2. **墨水色调对比** - 使用不同透明度的墨水色（黑色）作为文本和元素颜色，提供自然的层次感
3. **简约布局** - 双栏设计，充分利用留白，突出内容
4. **交互反馈** - 独特的墨水扩散动画，为点击操作提供优雅的视觉反馈

## 核心文件 (globals.css)

全局样式文件定义了整个站点的基础样式和自定义组件样式，主要包括：

### 基础样式变量
- 定义了背景色、前景色和墨水色等 CSS 变量
- 设置了基础的文字渲染优化

### 墨水点击动画
- 使用 `@keyframes` 定义墨水扩散动画
- 设置了动画的透明度变化和缩放效果
- 使用了平滑的缓动函数实现自然的动画效果

### 自定义组件样式
- 文章正文排版样式（.prose）
- 侧边栏链接样式
- 图片悬停效果

## Tailwind 集成

样式系统与 Tailwind CSS 紧密集成：
- 使用 `@tailwind` 指令导入 Tailwind 的基础、组件和工具类样式
- 通过 `@layer components` 扩展 Tailwind 的组件样式
- 在独立的 `tailwind.config.js` 文件中定义了自定义颜色、字体和动画

## 色彩系统

设计了两个主要的颜色系列：

### 米色系列 (cream)
- cream-50: #FFFDF7 - 最浅的背景色
- cream-100: #FFF8E8 - 主背景色
- cream-200: #F8F0DC - 轻微强调和悬停状态
- cream-300: #F2E8D0 - 边框和分隔线
- cream-400: #EAE0C9 - 强调元素
- cream-500: #E0D6BB - 最深的强调色

### 墨水系列 (ink)
- ink-light: rgba(0, 0, 0, 0.6) - 次要文本
- ink-default: rgba(0, 0, 0, 0.8) - 正文文本
- ink-dark: rgba(0, 0, 0, 0.9) - 标题和重点文本

## 响应式设计

样式系统支持响应式设计：
- 使用 Tailwind 的断点系统自动适应不同屏幕尺寸
- 关键组件（布局、导航、文章内容）都有响应式调整
- 保持内容的可读性在各种设备上的一致性

## 未来计划

- 添加暗色模式支持
- 扩展自定义动画效果
- 增加可选的配色方案
- 优化移动端交互体验