# 库层 (Lib) 设计架构

本目录包含博客系统的核心功能库和工具函数，为整个应用提供数据处理和业务逻辑支持。

## 组件结构

### Notion 公开页面访问 (`notion-public.ts`)

提供从公开 Notion 页面获取数据的功能，无需 API 密钥。主要功能：
- 获取公开 Notion 页面的 HTML 内容
- 解析页面中的 JSON 数据
- 支持多种数据提取模式，增强兼容性
- 错误处理和日志记录

### Notion 内容处理 (`notion-content.ts`)

将从 Notion 获取的原始数据转换为博客所需的结构化数据。主要功能：
- 从 Notion 数据中提取博客文章列表
- 提取单篇文章的详细内容
- 将 Notion 块转换为 Markdown 格式
- 处理文章元数据（标题、日期、摘要、标签、分类等）

### Notion 非官方API客户端 (`notion-client-api.mjs`)

提供与Notion公共页面交互的功能，使用非官方的`notion-client`库获取数据。主要功能：
- 从Notion URL或页面ID获取公共页面数据
- 支持解析和提取博客文章内容
- 支持解析和提取集合（数据库）内容
- 分析页面结构和内容

## 设计原则

1. **模块化** - 每个功能独立封装，易于测试和维护
2. **错误处理** - 优雅处理各种异常情况，避免应用崩溃
3. **类型安全** - 使用 TypeScript 提供类型定义，增强代码健壮性
4. **适配性** - 设计支持不同的数据源和数据结构
5. **性能优化** - 减少不必要的数据处理和转换

## 数据流

1. `notion-public.ts` 负责获取原始数据
2. `notion-content.ts` 处理数据转换和格式化
3. 页面组件通过这些工具获取最终可用的结构化数据

## 错误处理策略

- 网络错误：返回友好的错误消息，记录详细日志
- 数据解析错误：尝试多种解析方法，最大程度提取有效内容
- 格式转换错误：提供合理的默认值，确保核心功能可用

## 安装依赖

确保安装了必要的依赖：

```bash
npm install notion-client
```

## 使用方法

### 基本使用

```javascript
import { fetchNotionPage, extractPageId } from '../lib/notion-client-api.mjs';

// 从URL或页面ID获取Notion页面数据
const pageId = extractPageId('https://www.notion.so/MyPage-1234abcd5678efgh');
const recordMap = await fetchNotionPage(pageId);

// 或者直接使用页面ID
const recordMap = await fetchNotionPage('1234abcd5678efgh');
```

### 分析页面数据

```javascript
import { analyzeNotionData } from '../lib/notion-client-api.mjs';

// 分析页面结构
const analysis = analyzeNotionData(recordMap);

if (analysis.success) {
  console.log(`页面标题: ${analysis.title}`);
  console.log(`块数量: ${analysis.blockCount}`);
  
  // 块类型统计
  Object.entries(analysis.blockTypes).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
}
```

### 提取博客文章内容

```javascript
import { extractBlogPost } from '../lib/notion-client-api.mjs';

// 提取博客文章内容
const blogPost = extractBlogPost(recordMap);

if (blogPost) {
  console.log(`文章标题: ${blogPost.title}`);
  
  // 文章属性
  Object.entries(blogPost.properties).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  // 内容块
  console.log(`内容块数量: ${blogPost.contentBlocks.length}`);
}
```

### 提取集合（数据库）内容

```javascript
import { extractCollection } from '../lib/notion-client-api.mjs';

// 提取集合内容
const collection = extractCollection(recordMap);

if (collection) {
  console.log(`集合名称: ${collection.name}`);
  console.log(`页面数量: ${collection.pages.length}`);
  
  // 显示集合架构
  Object.entries(collection.schema).forEach(([key, schema]) => {
    console.log(`${schema.name} (${schema.type})`);
  });
  
  // 显示页面列表
  collection.pages.forEach(page => {
    console.log(`${page.title}`);
  });
}
```

## 测试脚本

项目包含一个测试脚本，可以用来测试从Notion页面获取数据：

```bash
node src/scripts/test-notion-client.mjs [Notion页面URL或ID]
```

如果不提供参数，脚本将使用环境变量`NOTION_PUBLIC_PAGE_ID`或默认的测试页面ID。

## 未来规划

计划添加的功能：
- 支持更多数据源（Notion API、其他CMS、Markdown文件等）
- 数据缓存层，减少外部请求
- 数据验证和净化
- 更丰富的内容格式支持（代码高亮、表格、嵌入内容等）
- 图像优化和处理
- 支持完整的Notion块类型
- 增强的数据查询能力

## 注意事项

- 非官方API依赖于Notion的内部API，可能会随时变化
- 仅支持公共Notion页面，不支持私有页面
- 由于依赖非官方API，不建议在生产环境中过度依赖 