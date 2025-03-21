# Hooks 设计架构

本目录包含博客系统使用的自定义 React Hooks，用于分离逻辑和提高代码复用性。

## useInkEffect

`useInkEffect.ts` 实现了博客站点特色的墨水点击效果。这个 hook 的主要功能是：

1. 在用户点击页面任何位置时创建一个墨水扩散的动画效果
2. 通过 DOM 操作动态添加和移除墨水效果元素
3. 处理事件监听器的添加和清理

### 实现原理

- 使用事件委托在文档级别监听点击事件
- 在点击位置创建一个绝对定位的 div 元素
- 应用 CSS 动画使其从点击位置扩散
- 动画完成后自动移除元素，避免内存泄漏

### 设计考量

- **性能优化**：使用 CSS 动画而非 JavaScript 动画，获得更好的性能
- **无侵入性**：效果不影响页面的正常交互和布局
- **清理机制**：使用 setTimeout 确保元素被正确移除，防止内存泄漏
- **React 生命周期集成**：返回清理函数以符合 useEffect 的规范

## 未来计划

计划添加的其他 hooks 包括：

1. **useScrollPosition** - 跟踪页面滚动位置，用于实现滚动特效或懒加载
2. **useDarkMode** - 实现暗色模式切换功能
3. **useLocalStorage** - 方便地使用本地存储保存用户偏好
4. **useNotionData** - 封装 Notion API 调用逻辑，用于从 Notion 获取内容