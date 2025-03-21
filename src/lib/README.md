# Notion非官方API客户端

本模块提供了与Notion公共页面交互的功能，使用非官方的`notion-client`库获取数据。

## 功能

- 从Notion URL或页面ID获取公共页面数据
- 支持解析和提取博客文章内容
- 支持解析和提取集合（数据库）内容
- 分析页面结构和内容

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

## 注意事项

- 这个API是非官方的，依赖于Notion的内部API，可能会随时变化
- 仅支持公共Notion页面，不支持私有页面
- 由于依赖非官方API，不建议在生产环境中过度依赖 